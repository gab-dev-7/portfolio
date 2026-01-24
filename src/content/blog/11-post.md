---
title: "Smart Cracking: Teaching Python to 'Guess' Like a Human"
description: "Why brute force is dead, and how I built a Markov Chain engine to predict passwords based on probability."
publishDate: "2026-01-24"
tags: ["python", "security", "algorithms", "math"]
---

## The Problem with Brute Force

If you try to crack a password by guessing `aaaaa`, then `aaaab`, you are fighting against entropy. This is inefficient because humans don't type random characters; we follow predictable patterns like `Password123`, `Welcome2026`, or `ilovecoffee`.

If I know you typed `P-a-s-s`, there is a statistical near-certainty that the next letter is `w`. A "dumb" brute-forcer would try `P-a-s-s-a`, `P-a-s-s-b`, and waste thousands of cycles before hitting the correct character. I wanted to build a tool that "understands" these patterns, so I implemented a Markov Chain engine in my security toolkit, **Sec-Suite**.

---

## The Theory: Markov Chains

At its core, a Markov Chain is a stochastic model where the probability of each event depends only on the state attained in the previous event. For password cracking, we look at a sequence of characters to predict the most likely successor.

Mathematically, the probability of the next character occurring is based on the previous characters:

$$P(X_{n} = x | X_{n-3}, X_{n-2}, X_{n-1})$$

In my implementation, I defined a "state" as a sequence of 3 characters, known as an **Order-3** chain. This effectively creates a **4-gram** model: it looks at a 3-character "window" to guess the 4th.

---

## The Logic: A "Sliding Window" of Probability

The engine works in two distinct phases: **Training** and **Generation**.

### 1. Training (Building the Brain)

I feed the model a wordlist, such as `rockyou.txt`. It slides a window of size 3 over every password, recording what character comes next.

```python
def train(self, passwords: List[str]):
    for password in passwords:
        for i in range(len(password) - self.order):
            # The "State" (e.g., "Pas")
            state = password[i : i + self.order]
            # The "Next" (e.g., "s")
            next_char = password[i + self.order]

            if state not in self.model:
                self.model[state] = []
            # Record that "s" can follow "Pas"
            self.model[state].append(next_char)
```

### 2. Generation (The Statistical Guess)

The beauty of this approach is that I don't need complex math libraries to calculate weights. By storing every occurrence in a list, `random.choice()` handles the probability distribution automatically.

If the model sees `Password` five times and `Passcode` twice, the list for the state `ass` looks like this: `['w', 'w', 'w', 'w', 'w', 'c', 'c']`. By using a list rather than a dictionary of percentages, we avoid manual math—`random.choice()` simply has a **71.4%** chance of picking `w` based on its frequency.

```python
def generate_password(self, max_length: int = 20) -> str:
    while len(password) < max_length:
        state = password[-self.order :]
        # Frequency in the list = Probability of selection
        next_char = random.choice(self.model[state])
        password += next_char
```

## The Bottleneck: Python's GIL

I initially included a multi-threaded cracker to generate and test passwords in parallel. However, I hit a wall called the **Global Interpreter Lock (GIL)**. In Python, the GIL prevents multiple native threads from executing bytecodes at once For CPU-bound tasks like password hashing, threading is essentially an "illusion of parallelism"—my script was barely faster than a single-threaded version.

### The Path Forward: Multiprocessing vs. C

To truly scale, I have two options:

1. **`multiprocessing`**: Use Python’s `multiprocessing` module to side-step the GIL by spawning separate memory spaces for each CPU core.
2. **The C Switch**: Port the hashing and generation logic to C/C++.

While `multiprocessing` is a great intermediate step, **Python is for logic; C is for speed**. To build a production-grade cracker, the engine needs to live closer to the bare metal.

---

## Why Serialize? (`.pkl`)

Training on `rockyou.txt` (14 million passwords) takes significant time. I used Python's `pickle` module to dump the memory state into a `.pkl` file so the "brain" loads instantly on startup.

> ### ⚠️ A Note on Security
>
> While `pickle` is convenient, it is **insecure** against erroneous or malicious data. Unpickling a crafted file can lead to **Remote Code Execution (RCE)**. For a public security tool, a safer alternative like JSON or a custom binary format is preferred.

---

## Conclusion

Building this taught me that "hacking" is often just applied statistics. By analyzing the _structure_ of passwords rather than just guessing blindly, we can reduce the search space by orders of magnitude. The next version of this engine will likely be written in C, but Python proved to be the perfect laboratory for proving the concept.

You can view the full source code on [GitHub](https://github.com/gab-dev-7/sec-suite).

---
