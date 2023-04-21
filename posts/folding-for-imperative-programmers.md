---
title: "Folding for Imperative Programmers"
date: "2023-04-20"
---

> More recently I discovered why the use of the `go to` statement has such
> disastrous effects, and I became convinced that the `go to` statement should
> be abolished from all "higher-level" programming languages (i.e. everything
> except, perhaps, plain machine code).

> _Edsger Dijkstra,
> [Go To Statement Considered Harmful](https://web.archive.org/web/20230411182617/https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf)_

In the 1960s, programmers often relied on `go to` statements when writing
code, using them in place of loops and other logical constructs. This made it
incredibly hard to understand the semantics of code, since it was impossible to
discern a program's control flow at a glance. Instead, one had to trace through
all of the `go to` statements in order to figure out what possible states the
program could be in.

Dijkstra ([of Dijkstra
fame](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)) recognized this,
and argued that "the `go to` statement as it stands is just too primitive; it is
too much an invitation to make a mess of one's program". I think that this
sentiment applies to loops in general, albeit to a lesser extent. Oftentimes
programmers don't need to concern themselves with the details of _how_ iteration
occurs (i.e. indices), just the end product. While I don't think `for` loops are
going away anytime soon, many "simple" loops can be refactored using
higher-order constructs from functional programming.

Folding is a higher-level abstraction for the notion of "accumulating" a value
in a container, i.e. a list. For example, consider the problem of finding the
sum of a list of integers. In an imperative language like C++, this might look
like:

```cpp
int sum_of_ints(vector<int> nums) {
  int accumulator = 0;        // (1)
  for (int num : nums) {
    accumulator += num;       // (2)
  }
  return accumulator;
}
```

Here we keep track of the total sum in `accumulator` and iterate through the
list, adding to `accumulator` as we go. In functional programming, this could be
handled via a fold, which takes three arguments:

- The starting value for the accumulator
- A function that "updates" the value of the accumulator, given an element from
  the container
- The container to accumulate through

In Haskell, this could be written as:

```haskell
sum_of_ints :: [Int] -> Int
sum_of_ints lst = foldl (\acc num -> acc + num) 0 lst
```

Here you can see that the lambda takes in the accumulator as its first argument,
and uses the current element of the list to "update" the accumulator to a new
value, corresponding to `(2)` from the imperative code. The `0` that comes after
the lambda is the initial value for our accumulator, corresponding to `(1)` in
the imperative code.

If we look at the type signature of `foldl`, we get:

```haskell
foldl :: (b -> a -> b) -> b -> [a] -> b
```

One might wonder why the type signature of the lambda is `b -> a -> b`, as
opposed to `a -> a -> a`. This is for generality purposes, since _the type of
the accumulator does not need to be the same as the type of the elements in the
container_. For example, what if we wanted to find the total amount paid out
to a list of `Employee`s?

```haskell
data Employee = Employee { name :: String
                       , salary :: Int }

sum_of_salaries :: [Employee] -> Int
sum_of_salaries employees =
  -- Pattern matching to extract salary from Employee
  foldl (\acc Employee { name = _, salary = salary }
    -> acc + salary) 0 employees
```

In this particular case, we are accumulating salaries (type `Int`), but the
elements of our container are type `Employee`. This allows for more flexibility,
and allows us to do more productive things than just "sum over a list of
`Int`s".

Remark 1: The astute may realize that `(\acc num -> acc + num)` is just applying
`+` to two arguments, we could have rewritten the first function as:

```haskell
sum_of_ints lst = foldl (+) 0 lst
```

Furthermore, one can then apply an [eta
reduction](https://en.wikipedia.org/wiki/Eta_reduction), yielding

```haskell
sum_of_ints = foldl (+) 0
```
