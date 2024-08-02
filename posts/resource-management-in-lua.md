---
title: "Resource Management in Lua"
date: "2024-06-09"
---

Recently while working on
[nvim-surround](https://www.github.com/kylechui/nvim-surround), I ran into a
scenario where I needed to manage resources; in particular
[`extmark`](https://neovim.io/doc/user/api.html#api-extmark)s. The only thing
you really need to know about them is that they represent coordinates in a text
buffer and get moved around as the buffer gets updated, which can be helpful for
capturing "semantic" locations. Here's some pseudocode for how I was using them:

```lua
local extmark_id = set_extmark(initial_pos)
edit_buffer()
local extmark_pos = get_extmark(extmark_id)
del_extmark(extmark_id)
-- Do something with the "updated" position
-- ...
```

However, it began to irk me that the "garbage collection" for the `extmark`s
wasn't automatic. Moreover, forgetting to clean them up could result in
hundreds, if not thousands of `extmark`s being re-calculated with every buffer
update. It occurred to me that I wanted bind the lifetime of the `extmark` to
the lifetime of its ID[^1], to avoid all the normal "footguns" like
[use after free](https://en.wikipedia.org/wiki/Dangling_pointer) or
[invalid dereference](https://en.wikipedia.org/wiki/Null_pointer). To accomplish
this, I created a wrapper function that would handle instantiating and
destroying the `extmark` automatically:

```lua
local with_extmark = function(initial_pos, callback)
  local extmark_id = set_extmark(initial_pos)
  callback()
  local extmark_pos = get_extmark(extmark_id)
  del_extmark(extmark_id)
  return extmark_pos
end
```

Then, whenever I needed to use an `extmark`, I could simply call `with_extmark`,
without worrying about cleaning up any references:

```lua
local position = with_extmark(initial_pos, function()
  edit_buffer()
end)
-- Do something with the "updated" position
-- There are no extmark references visible here!
```

It's worth mentioning that none of the content here has been specific to Neovim
`extmark`s; we could have instead discussed any other resource, like memory,
mutexes, sockets, and more! As long as the language supports creating closures,
we can use wrapper functions to ensure that no resources get leaked in our
programs, avoiding a whole host of issues.

---

[^1]:
    In languages with constructors/destructors like C++, this can be done by
    binding an object's lifetime to a resource. In this case, creation of the
    object would "claim" the `extmark`s, and it "releases" the `extmark`s once
    it goes out of scope. This is also known as
    [RAII](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization).
