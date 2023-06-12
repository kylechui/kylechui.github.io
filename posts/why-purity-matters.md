---
title: "Why Purity Matters"
date: "2023-06-11"
---

In the world of functional programming, the notion of _purity_ often comes up.
But what is it? Why should we as programmers care about such a concept? It turns
out that pure functions enable us to write more straightforward and performant
code.

## What is a Pure Function?

A _pure_ function:

- Always returns the same output for a given input
- Does not modify its surrounding environment
  - No mutating local variables, writing to files, reading from the console,
    etc.

In other words, a pure function is an isolated piece of code that only relies on
its inputs. For example, consider a function `is_even` that returns whether an
input integer is even or not. If you call `is_even(5)`, it will always return
`false`, no matter what. Notice that this isn't necessarily true for other
functions, e.g. a function `is_leap_year` that tells you if the current year is
a leap year. Sometimes calling `is_leap_year()` will return `true`, and other
times `false`.

## Reasonable Code

Another perspective is to think of function arguments as _explicit
dependencies_, since a function's result depends on them. Then it becomes clear
that `is_even` _has no implicit dependencies_, while `is_leap_year` _implicitly
depends on the current year_. Implicit dependencies are dangerous, because they
introduce additional state to our program, making it harder to reason about. If
somebody makes changes to other parts of the codebase, your code might break!

To avoid this, we can make our dependencies explicit where possible. In the case
of `is_leap_year`, we modify the function to take in a year, represented by an
integer. This _localizes_ all of the dependencies for our function; any bugs
exist inside the function itself, and nowhere else, making them easier to reason
about and debug.

## Need for Speed

Since pure function calls don't modify their surrounding environments, they
can't interfere with one another. Thus:

- They can be parallelized, since there are no race conditions (the threads
  cannot affect each other)
- They can be memoized, since repeated function calls will always yield the same
  result
  - Instead of recomputing values each time, we replace function calls with
    their results[^1]

These are (in my opinion) a few of the most important reasons to care about pure
functions; more benefits can be found
[here](https://alvinalexander.com/scala/fp-book/benefits-of-pure-functions/).

---

[^1]: This is sometimes called _referential transparency_.
