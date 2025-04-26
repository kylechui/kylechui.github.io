---
title: "Taste (6 months)"
date: "2025-04-21"
---

Through my (very short) time working in software, I've picked up a certain
"taste" for things. After reading through
[a post by Chris Kiehl](https://chriskiehl.com/article/thoughts-after-6-years),
I felt inspired to write them down. I have only been working professionally for
~6 months, so the following are just current thoughts based on my (very limited)
experience so far and subject to change!

## Current Tastes

### Prioritize Simplicity

While abstractions enable you to accomplish more with less code, they can make
things more difficult to understand. I have seen a few examples of code that is
very difficult to navigate and reason about, due to too many layers of
inheritance and imports from other packages. When working with a codebase, view
complexity as a currency and try to spend it as wisely as possible.

### Optimize code for readers, not writers

Code is generally read (by oneself and others) _many_ more times than it is
written, so it is worth keeping your future readers in mind. Allowing them to
understand your code more easily will make future modifications more simple.

A corollary is that I try to leave more comments in my code; my general rule of
thumb is to add comments if I think they would improve clarity. I do not
generally agree with the sentiment "rewrite your code to make comments
unnecessary", since following that blindly can lead to code that is harder to
read.

One particular example I have seen is over-extraction of blocks of code into
their own methods, where short 2--3 line sections are pulled into different
functions. While this sounds fine at first, if that function is only ever called
in one place, all we are doing is moving closely related code further apart.
When reading code in the browser (as is often the case for code reviews), it is
annoying to scroll back and forth (or worse, open multiple tabs) just to
understand one function that could have been a contiguous block with a couple of
comments sprinkled in.

### Static types > Dynamic types

Statically typed languages (and static analysis in general) help "move" errors
from compile-time to runtime, where they are cheaper to diagnose and fix. While
some may say that the increased verbosity is tedious, I think that explicit
types can serve as documentation to the reader. Moreover, types have something
over other forms of documentation: they are verified by the compiler and as a
result are kept up-to-date (assuming the type checker passes).

### Tooling is very important

Knowing your tools better not only allows you to move faster, but also enables
you to do different things altogether. When mundane tasks become trivial to do,
it frees up your attention to think about other, more difficult problems. Here's
a few examples I think are worth highlighting:

- If you know how to touch type, you rarely think about how your fingers
  actually move to type letters, your thoughts "just appear on the screen"
- If you use a keyboard-based editor like Vim/Emacs, you rarely think about "how
  do I make these changes", they just happen, letting you focus on the changes
  themselves
- If you get good at Git, you worry less about merge conflicts and just trust in
  your ability to resolve them as they arise

Tools can also help groups of people reach consensus by acting as an "unbiased"
third party. Formatters help teams get over the minutiae of the syntax on the
screen, and focus on the semantics of what is written. I think that more
opinionated tools are also better, since they do not allow for different
"interpretations" by different people (e.g.
[`black`](https://github.com/psf/black)).

### Implementation inheritance is bad

Dynamic dispatch makes it unclear what code is actually getting executed at
runtime, making programs much more difficult to understand by just reading them.
There have been many cases where reading through a codebase inevitably leads me
to some interface implemented by multiple classes, making it a hassle to find
the actual implementation.

Another issue with inheritance is that it couples together code that may only be
incidentally the same (e.g. configurations for two different services). Issues
arise when code evolves over time, and what once was code de-duplication quickly
becomes a nest of exceptions to the rule. Don't shy away from code duplication
if it makes things easier to read and maintain.

## Potpourri

Here are some more concrete opinions (with some repeats from before):

- Prioritize longevity over feature count (i.e. practice saying no)
- Static analysis is essential
  - Write code that is more easily verified by static analyzers
- Type inference is nice, but can sometimes make code harder to read if the code
  has no types whatsoever
- Functions exported to be used in other modules deserve to have a comment
  explaining what they do
  - Write comments to show up in
    [LSP's `textDocument/hover`](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_hover)
- Copy/pasting code is OK, if it improves legibility
- If you only have one class, you almost certainly do not need it to implement
  an interface
- Inheritance bad
- While comments should generally say _why_ something is a certain way, it's
  fine to say _what_ something does if it improves legibility
- Immutability should be the default
- `NullPointerException`s are the bane of my existence (prefer languages that
  mandate optional types)
- Model your types after the problem space
  - Data should always be semantically valid upon construction, and operated on
    in such a way that preserves its validity
  - [Builder pattern](https://refactoring.guru/design-patterns/builder) is not
    ideal because it allows you to create half-formed objects
- CLI tools are great
  - Use [`fzf`](https://github.com/junegunn/fzf/)
    - I like to use it for jumping around [`tmux`](https://github.com/tmux/tmux)
      sessions, git branches, directories, etc.
  - Use [`ripgrep`](https://github.com/burntsushi/ripgrep/)
    - This just feels illegally fast
  - Learn [`jq`](https://jqlang.org/)
    - This almost feels like adding a type system on top of shell scripting,
      since it allows me to worry about the actual data instead of parsing
      values from text

## Things I Want To Develop Taste For

- Grok more programming languages! Many languages have some sort of "killer
  feature", and it would be good to learn what they are and why:
  - Rust: Borrow checker/ownership semantics
  - Zig: Comptime
  - Lisp: S-expressions (code as data), macros
- Monolithic codebases vs. multiple packages
  - I've only ever worked in the latter, and have a slight preference for it
    because LSP seems like it would work better in smaller projects

## Tasteful Resources

- _The Grug Brained Developer - Carson Gross_
  - Blog: https://grugbrain.dev/
- _Types, and why you should care - Ron Minsky_
  - Video: https://www.youtube.com/watch?v=yVuEPwNuCHw
- _A Philosophy of Software Design - John Ousterhout_
  - Book: https://www.amazon.com/gp/product/173210221X
  - Video: https://www.youtube.com/watch?v=bmSAYlu0NcY
- _Using Windows without a mouse - John D. Cook_
  - Blog:
    https://www.johndcook.com/blog/2009/11/09/using-windows-without-a-mouse/
