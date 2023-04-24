---
title: "Folding for Imperative Programmers"
date: "2023-04-20"
---

> _More recently I discovered why the use of the `go to` statement has such
> disastrous effects, and I became convinced that the `go to` statement should
> be abolished from all "higher-level" programming languages (i.e. everything
> except, perhaps, plain machine code)._
>
> _~Edsger Dijkstra,
> [Go To Statement Considered Harmful](https://web.archive.org/web/20230411182617/https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf)_

In the 1960s, programmers often relied on `go to` statements when writing code,
using them in place of loops and other logical constructs. This made it
incredibly hard to understand the semantics of a program, since it was
impossible to discern its control flow at a glance. Instead, one had to trace
through all of the `go to` statements in order to figure out what possible
states the program could be in.

Dijkstra ([of Dijkstra
fame](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)) recognized this,
and argued that "the `go to` statement as it stands is just too primitive; it is
too much an invitation to make a mess of one's program". I think that this
sentiment applies to loops as well, albeit to a lesser extent. In many
instances, the actual details of _how_ iteration occurs aren't relevant to the
problem at hand. While I don't think loops are going away anytime soon, many
"simple" loops can be refactored using higher-level constructs from functional
programming.

Folding is an abstraction for the notion of "accumulating" a value in a
container, i.e. summing the elements of a list. In an imperative language like
C++, that might look like:

```cpp
int sum_of_ints(vector<int> nums) {
  int acc = 0;
  for (int num : nums) {
    accumulator += num;
  }
  return acc;
}
```

As we iterate through the list, we keep track of the current partial sum in
`acc` (short for accumulator). In functional programming, this could be handled
via a fold[^1], which takes three arguments:

- A starting value for the accumulator
- A function that "updates" the value of the accumulator, given an element from
  the container
- A container to traverse

In Haskell, we would use the `foldl`[^2] function and write:

```haskell
sum_of_ints :: [Integer] -> Integer
sum_of_ints lst = foldl (\acc num -> acc + num) 0 lst
```

While these two implementations may look very different, they are semantically
quite similar:

- Both solutions initialize the accumulator to 0
- The lambda in the functional code[^3] updates the value of the accumulator,
  just like the body of the `for` loop in the imperative code

There are a few benefits of writing this code using a fold:

- Shorter code tends to be easier to reason about and debug
- Folding does not "leak variables into an outer scope", since `acc` is only
  visible inside the fold
- The idea of folding generalizes well to other containers, e.g. trees, maps,
  etc.

To get an even better understanding of `foldl`, let's take a look at its type
signature:

```haskell
foldl :: (b -> a -> b) -> b -> [a] -> b
```

One might wonder why the lambda has type `b -> a -> b`, as opposed to `a -> a ->
a`. This is for generality purposes, since _the type of the accumulator does not
need to be the same as the type of the elements in the container_. For example,
what if we wanted to find the total amount paid out to a list of `Employee`s?

```haskell
-- Defines an Employee type to have a name and salary
data Employee = Employee { name :: String
                       , salary :: Integer }

sum_of_salaries :: [Employee] -> Integer
sum_of_salaries employees =
  -- Pattern matching to extract salary from Employee
  foldl (\acc Employee { name = _, salary = salary }
    -> acc + salary) 0 employees
```

In this particular case, we are accumulating salaries (type `Integer`), but the
elements of our container are type `Employee`. This allows for more flexibility,
and allows us to do more productive things than just "sum over a list of
`Integer`s".

Programming is all about finding the right set of abstractions to solve
problems. Folding is one of those abstractions, providing an idiomatic way to
solve the recurring problem of accumulation over a container. While not
universally applicable, folds improve the expressiveness and correctness of our
code.

---

[^1]:
    In other languages, this may be called accumulate (C++) or reduce
    (Python).

[^2]:
    The folding function we use here is called `foldl` and not just `fold`
    because there are two kinds of folds: left-associative (`foldl`) and
    right-associative (`foldr`). Hence if our operation is non-associative,
    `foldl` and `foldr` yield different results. For example, if our operation
    was subtraction instead of addition, our choice of folding function would
    matter. See [the Haskell wiki](https://wiki.haskell.org/Foldr_Foldl_Foldl')
    for more information.

[^3]:
    The astute may realize that `(\acc num -> acc + num)` is just an
    application of `+` to two arguments, so we could rewrite `sum_of_ints` as:

    ```haskell
    sum_of_ints lst = foldl (+) 0 lst
    ```

    Furthermore, one can then apply an [eta
    reduction](https://en.wikipedia.org/wiki/Eta_reduction), yielding

    ```haskell
    sum_of_ints = foldl (+) 0
    ```
