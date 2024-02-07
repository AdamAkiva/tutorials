## JSDoc vs Typescript debate, what should you use?

### Last update: 07.02.2024

### 5 minutes read

---

**TL;DR:**
Despite it's shortcomings, especially from the project setup and ease of use,
use Typescript.  
Continue reading to understand my reasoning.

## History

JSDoc was presented very early on, based on the success of JavaDoc.  
Typescript was written by microsoft to handle the shortcomings of Javascript.  
Both of these solutions are results to solve the issue of development of
large-scale applications with dynamic language.

## How do they work

JSDoc uses comments to annotate functions/classes and add types/description
to them.  
For example:

```js
/**
   * Calculates the circumference of the Circle.
   * @param {number} radius The radius of a circle.
   * @return {number} The circumference of the circle.
   */
  calculateCircumference(radius) {
    return 2 * Math.PI * radius
  }
```

Typescript is an ECMA2015 strict superset.  
This means that Typescript extends Javascript code in a fully compatible way.  
Hence, every valid Javascript code is a valid Typescript code.  
For example:

```ts
  /**
   * Calculates the circumference of the Circle.
   */
  calculateCircumference(radius: number): number {
    return 2 * Math.PI * radius
  }
```

## Comparison

Before we compare both options, it's fair to say both options make your code
more readable and maintainable, which is what they were built to achieve.  
With that out of the way let's compare them:

### JSDoc

**Advantages:**

- Simple
- Most IDEs support it
- No additional configurations needed by the developer. Just add comments

**Disadvantages:**

- Limited options, there are so many tags able to be used
- No code reuse (in contrast to Typescript types/interfaces)
- It is a comment, and like the relationship between every developer and comments,
  you will probably forget to update it after an implementation change.
- Documentation tool, not a static type checker.

### Typescript

**Advantages:**

- Mature ecosystem with a lot of different options (types/interfaces, enums,
  generics, and much more)
- Static type checks before your code runs (static type analyzer)
- Can add additional language features which are transpiled to supporting
  Javascript code on runtime (enum as an example).
- Full IDEs support

**Disadvantages**

- Complex. It is basically another language to learn
- Complex configuration. Typescript makes a project setup much more complicated
  than just creating a Javascript file and running it.

### The future

Typescript always seemed like the raising star, until **that** interview from the
creator of Svelte, Rich Harris, about his team move from Typescript back to
Javascript.  
His main point was the fact that Typescript is a pain to configure and build.
As expected the community response was interesting to say the least, some supported
the general idea while others were dismissive and didn't agree with that move.

Let's get one thing out of the way. This is not the end of Typescript, not even close.  
This change only affects the development of Svelte, not the usage, you will still
be able to use Typescript with Svelte after this change.

You can view the full interview [here](https://www.youtube.com/watch?v=MJHO6FSioPI&t=99s)

### What's next?

This section is my personal opinion so take that with a grain of salt (or a pint
if you are a JSDoc fan).

I'll start by dropping the bombshell. Typescript is 99.99% the way forward.  
The solution to a complex issue (Javascript being a dynamic language which is a
massive issue in of itself), is not to move backwards, but to fix what is wrong.

The main issue developers have is the complexity level Typescript adds to
starting and working with a project and its many dependencies.  
In the last few years attempts to resolve that issue (and many of NodeJS issues,
such as [everything related to NPM](https://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code))
were presented in the form of new Runtime environments which support Typescript
as a first class citizen among other things (something which the Node team discussed way too many
times, with no conclusion in sight. [For example](https://github.com/nodejs/node/issues/43818))
such as Deno and Bun.

Hopefully the Node team will make Typescript a first class citizen as well at
some point in future (the sooner the better).
