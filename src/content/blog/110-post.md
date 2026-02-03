---
title: "C vs Node.js: I fought the Event Loop, and the Loop (almost) won"
description: "My journey attempting to beat Node.js with raw C. From blocking I/O failures to multi-threaded Epoll, I learned just how optimized V8 really is."
publishDate: "2026-02-03"
tags: ["c", "node", "systems", "performance", "networking"]
---

## The Hypothesis

I love C. It’s raw, it’s low-level, and it forces you to understand memory. Naturally, I assumed that a raw TCP server written in C would obliterate a server written in JavaScript (Node.js).

Node.js runs on V8 (a JIT engine) and carries the weight of a runtime. C runs directly on the metal. The winner seemed obvious.

I set up a benchmark between my **Surface Pro 9** (Client) and my **Ubuntu Homelab** (Server) over a Tailscale VPN.

## Attempt 1: Node.js (The Baseline)

I ran a standard "Hello World" in Node.js, which uses the **Event Loop** (Non-blocking I/O) by default.

- **Requests/Sec:** ~15,860
- **Errors:** 0

**The Reality Check:** Node.js didn't just win; it destroyed my C server. It handled concurrency effortlessly because it never waits for I/O.

## Attempt 2: The Naive C Server

My first attempt was a standard, blocking C server. It used `accept()`, `write()`, and `close()` in a simple `while` loop.

I hit it with `wrk` (12 threads, 400 connections).

- **Requests/Sec:** ~6,500
- **Errors:** 160,000+ (Socket Read Errors)

**The Failure:** It was a disaster. Because the server processed requests one by one (Blocking I/O), the OS connection queue filled up instantly, and packets were dropped.

## Attempt 3: The Redemption (Single-Threaded Epoll)

I wasn't going to let C lose. I rewrote the server using **`epoll`**, the Linux kernel's high-performance notification mechanism. I also implemented **HTTP Keep-Alive** to stop closing sockets unnecessarily.

- **Requests/Sec:** ~13,580
- **Errors:** 0

**The Frustration:** I fixed the stability, but I was _still_ slower than Node.js. Why? Because `libuv` (Node's C core) and V8 are hyper-optimized. My single-threaded C code just couldn't keep up with 15 years of Google engineering.

## Attempt 4: The Nuclear Option (Multi-Threading)

Node.js is single-threaded. My server has 4 cores. It was time to cheat (or rather, use my hardware).

I used `pthread` to spin up 4 worker threads. But how do you share a port? I used `SO_REUSEPORT`, a Linux kernel flag that allows multiple sockets to bind to port 8080 simultaneously. The kernel handles the load balancing.

- **Requests/Sec:** **~17,060**
- **Errors:** 0

## The Verdict

We finally did it. We beat JavaScript.

| Implementation          | Req/Sec    | Notes                       |
| :---------------------- | :--------- | :-------------------------- |
| **Node.js**             | 15,859     | The Gold Standard           |
| **Blocking C**          | 6,529      | 100% Fail rate              |
| **Epoll C (1 Thread)**  | 13,578     | Faster, but not fast enough |
| **Epoll C (4 Threads)** | **17,059** | **Victory**                 |

## Conclusion

I started this experiment to prove C was faster. Instead, I learned that **Architecture > Language**.

A badly written C program will always lose to a well-optimized Runtime. Even a _well-written_ single-threaded C program might lose to the V8 engine. But if you dig deep enough into the OS using `epoll`, `SO_REUSEPORT`, and threads you can eventually reclaim the crown.

Check out the source code for the final server on my [GitHub](https://github.com/gab-dev-7/homelab/tree/main/node%20vs%20C).

---
