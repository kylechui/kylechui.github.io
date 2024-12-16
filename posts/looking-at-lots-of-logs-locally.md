---
title: "Looking at Lots of Logs, Locally"
date: "2024-12-14"
---

Recently at work, I've had to look at a lot of generated HTML files, usually in
the form of logs or some test output. This would not be a problem, if not for
the fact that I build/test all of my code on a beefy remote server (thank you
AWS). After a few attempts[^1] at reading HTML directly on my remote server
using Vim, I quickly realized that there had to be a better way. That left me
wondering:

> How can I view these remote HTML files in a nice way (i.e. in a browser)?

Trying to resolve this in a way that I found satisfying was more work than I
thought, given two challenges:

1. HTML files often have local dependencies on other resources (e.g. CSS styles,
   linked HTML files). How can I ensure that all dependencies will get pulled to
   my local machine, so the files are not broken?
2. I would like this operation to be _convenient_, i.e. I don't want to type a
   long command each time, so some script should automate this action.

## Attempt 1: Good ol' `scp`

My first thought was to just use
[`scp`](https://www.man7.org/linux/man-pages/man1/scp.1.html) on my local
machine to copy over the directory containing the HTML file like so:

```sh
scp -r kylechui@$REMOTE_MACHINE:/path/to . && open to/index.html
```

Then if I ever re-ran the command that generated `index.html`, I could use
[`fzf`](https://github.com/junegunn/fzf/)'s
[Ctrl+R binding](https://github.com/junegunn/fzf?tab=readme-ov-file#key-bindings-for-command-line)
to quickly re-open the file in my browser.

However, if I ever needed to open an HTML file in another directory, I would
need to manually type (or copy-paste) the above command at least once, a tedious
task[^2]. Furthermore, the dependencies of the HTML file an technically live
anywhere on the remote machine, causing issues if they are not all in the HTML
file's parent directory. This never actually happened in practice, but the
possibility still irked me.

## Attempt 2: SSH Port forwarding

I was discussing this issue with one of my friends, and they suggested using
[SSH port forwarding](https://www.ssh.com/academy/ssh/tunneling-example), since
that's how
[VSCode's remote SSH plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)
works. The idea is to set up a basic HTTP file server on the remote machine, and
use port forwarding to access that file server locally. We can add the `-L` flag
to our `ssh` command to do the port forwarding:

```sh
ssh -L localhost:$LOCAL_PORT:localhost:$REMOTE_PORT $REMOTE_MACHINE
```

Then on the remote machine, start a
[Python HTTP server](https://docs.python.org/3/library/http.server.html) in
`$HOME`[^3]:

```sh
# On remote machine!
python -m http.server $REMOTE_PORT
```

Now I could see my HTML files by visiting
`localhost:$LOCAL_PORT/path/to/index.html` in the browser! There were a few
benefits I found with this approach:

- Since the HTTP file server can see every file (in `$HOME`) on my remote
  machine, none of the relative paths will be broken. Moreover, it serves _only_
  the files required by the main `index.html`, decreasing the amount of data
  sent over the network.
- As we are re-using the same `ssh` connection for port forwarding, there is
  lower latency compared to an `scp` call (which needs to re-connect and
  authenticate with the remote machine).

I was still bothered by the need to copy-paste the paths from console output to
the browser, but in my opinion this was a pretty solid solution.

## Attempt 3: Kitty + SSH Port forwarding

In comes [Kitty](https://sw.kovidgoyal.net/kitty/), a terminal emulator I only
recently started using. It has
[native capabilities for dealing with remote files](https://sw.kovidgoyal.net/kitty/kittens/remote_file/),
including clicking on
[terminal hyperlinks](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda).
Problem solved, right? Unfortunately, by default Kitty only copies over the
exact file under the cursor, which will lead to broken links/styling. We can
override this behavior with
[custom kittens](https://sw.kovidgoyal.net/kitty/kittens/custom/), and call a
custom script whenever a URL is clicked in an SSH session. In `kitty.conf`, we
override the default click behavior to call a custom Python script:

```
mouse_map ctrl+shift+left release grabbed,ungrabbed kitten override_click.py
```

Then we create a custom click handler in `override_click.py`:

```python
import os
from kitty.boss import Boss
from kittens.tui.handler import result_handler

def main(args: list[str]) -> str:
  pass

@result_handler(no_ui=True)
def handle_result(args: list[str], answer: str, target_window_id: int, boss: Boss) -> None:
  w = boss.window_id_map.get(target_window_id)
  if w is None:
    return

  # Obtain the hyperlink under the cursor
  mouse_data = w.current_mouse_position()
  cell_x, cell_y = mouse_data.get("cell_x"), mouse_data.get("cell_y")
  line = w.screen.line(cell_y)
  hyperlink_id = line.hyperlink_ids()[cell_x]
  url = w.screen.hyperlink_for_id(hyperlink_id)

  # Sometimes Kitty will recognize text as clickable, even if it does not use
  # the hyperlink protocol. For example, regular website URLs like `https://...`
  # or a local path like `file://...`. In this case, we can scan the screen
  # line-by-line until we find the end of the HTML file path, and use that as
  # our URL. This detection code can definitely be improved, but roughly works.
  if url is None:
    full_string: str = str(line)
    current_line = w.screen.line(cell_y)
    # If the current line fills up the screen, keep reading the next line. The
    # `rstrip` is used because Kitty interprets empty space at the end of a line
    # in `tmux` sessions as whitespace.
    while cell_y < w.screen.lines and len(str(current_line).rstrip()) == w.screen.columns:
      cell_y += 1
      current_line = w.screen.line(cell_y)
      full_string += str(current_line)
    url = re.sub("^.*?([^ ]*://[^ ]*).*?$", r"\1", full_string)

  # My local machine is running MacOS, which does not have a `/home/kylechui`
  # directory. Using this, we can disambiguate between file paths on my local
  # vs. remote machines, although there's probably a better way to do this.
  remote_machine_delimiter: str = "/home/kylechui"
  if remote_machine_delimiter in url:
    # Open the URL in your browser of choice
    relative_path: str = url.split(remote_machine_delimiter)[1]
    os.system(f'open "http://localhost:$LOCAL_PORT{relative_path}"')
  else:
    # Fallback on default click behavior
    w.mouse_click_url()
```

Now whenever a program outputs some `file://...` path or a terminal hyperlink, I
can just hold `ctrl+shift` and click on it to open it in my browser!

## What's Next?

I'm overall very happy with this result, and this works for my particular use
case. That being said there are a definitely a few things that can be improved:

- Better URL parsing in the click handler
  - Handle URLs that contain whitespace
  - Handle URLs that happen to fill up the entire screen horizontally
- Better disambiguation between local and remote machines in the click handler,
  e.g. if the local and remote machines are both Linux
- If text wrapping causes the URL to span multiple lines in the screen, then
  only the first line is clickable

I hope you're able to take some ideas/inspiration from this to improve your own
workflow!

---

[^1]: I call them _attempts_ because none of them were successful.
[^2]:
    Yes, it's not that bad, but I'm lazy. In any case, I'm
    [automating this to save energy, not time](https://www.johndcook.com/blog/2015/12/22/automate-to-save-mental-energy-not-time/).

[^3]:
    I did this in a `tmux` session to keep the file server running permanently.
