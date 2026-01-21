---
title: "Demystifying Non-Blocking I/O in C"
description: "Why I used select() and POSIX sockets to build a port scanner that doesn't hang."
publishDate: "2026-01-21"
tags: ["c", "networking", "posix", "low-level"]
---

## The Problem with Blocking

When I decided to write a [TCP Port Scanner](https://github.com/gab-dev-7/port-scanner) in C, I initially looked at the standard `connect()` system call. The problem with the default behavior (blocking mode) is that if you try to connect to a firewall that simply drops packets (a "filtered" port), your program hangs. It waits for the OS timeout, which can be anywhere from 30 seconds to several minutes.

For a scanner checking 1,000 ports, that is unacceptable. I needed a way to control the timeout precisely, say, 1 second per port—and keep the application responsive to `Ctrl+C`.

## The Solution: `select()`

The solution is to set the socket to **non-blocking mode** using `fcntl`. When you call `connect()` on a non-blocking socket, it returns immediately. Usually, it returns `-1` with the error `EINPROGRESS`. This isn't a failure; it just means the TCP handshake is happening in the background.

To wait for that handshake to finish (or fail) with a custom timeout, I used `select()`.

### The Critical Trap: `SO_ERROR`

Here is where many implementations fail. When `select()` tells you the socket is "writable," that doesn't necessarily mean the connection succeeded. It just means the handshake is _done_. It could have been a success (ACK) or a failure (RST).

If you don't check the actual socket error, you will report closed or filtered ports as "Open."

Here is the core logic from my implementation:

```c
// Inside scan_port()...

// Initiate non-blocking connect
int res = connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr));

if (res < 0 && errno != EINPROGRESS) {
    close(sock);
    return -1;
}

// Use select() to wait for writeability with a timeout
fd_set writefds;
FD_ZERO(&writefds);
FD_SET(sock, &writefds);

struct timeval timeout;
timeout.tv_sec = timeout_sec;
timeout.tv_usec = 0;

int select_result = select(sock + 1, NULL, &writefds, NULL, &timeout);

if (select_result == 0) return 1; // Timeout
if (select_result < 0) return -2; // Error

// THE CRITICAL STEP: Check SO_ERROR
int so_error = 0;
socklen_t len = sizeof(so_error);

// If we skip this, we get false positives!
if (getsockopt(sock, SOL_SOCKET, SO_ERROR, &so_error, &len) < 0) {
    close(sock);
    return -2;
}

// If so_error is 0, the port is truly open.
return (so_error == 0) ? 0 : -1;
```

### Why this matters:

Writing this scanner wasn't just about finding ports. It was more about understanding the lifecycle of a TCP connection. By forcing myself to handle `EINPROGRESS` ad `SO_ERROR` manually, I gained a much clearer picture of how the OS handles networking than i ever would have using a Python lib.

You can view the full source code on [GitHub](https://github.com/gab-dev-7/port-scanner).

---
