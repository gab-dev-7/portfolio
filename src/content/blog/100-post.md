---
title: "The Only Linux Course You Need: OverTheWire Bandit (0-10)"
description: "Why grep and find are better than Metasploit, and a walkthrough of the first 10 levels of Bandit with blurred flags."
publishDate: "2026-01-25"
tags: ["linux", "ctf", "bash", "security"]
---

If you ask a beginner how to start hacking, they usually ask "which tool should I download?" They want the "Magic Button."

But relying on automated tools without understanding the underlying system is like being a pilot who only knows how to use autopilot. If the system fails, or if the tool doesn't work, you crash. You need to know how to fly manually.

That is why I recommend **OverTheWire: Bandit** to everyone. It isn't just a security game; it is a trial-by-fire Linux administration course. It forces you to understand:

- **The Filesystem Hierarchy:** Why are things in `/var` vs `/tmp`?
- **Permissions:** Who owns what, and why does it matter?
- **Piping:** How to chain small tools to solve big problems.

Below is my walkthrough for Levels 0–10. I have blurred the flags so you can't just copy-paste them—you have to run the commands yourself.

## The Setup

I keep it simple:

1.  **Terminal:** On the right half of my screen.
2.  **Notes:** A simple `.txt` file on the left where I paste the passwords as I find them.
3.  **Scripting:** If `bash` gets too messy, I switch to Python. For most of the first 10 levels, the shell is king, but I'll show you where Python becomes cleaner.

---

## Levels 0-3: Learning to Walk

The first few levels are about muscle memory: `ls`, `cd`, and `cat`.

### Level 0 → 1

**Goal:** Log in via SSH.
We connect to `bandit.labs.overthewire.org` on port `2220`.

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
# Password: bandit0

```

Once in, we check the files.

```bash
ls
cat readme

```

**Flag:** <span class="spoiler">NH2SXQwcBdpmTEzi3bvBHMMtH66vVXjL</span>

### Level 1 → 2 (The "Dash" Problem)

**Goal:** Read a file named `-`.
If you try `cat -`, the program thinks you are trying to read from `stdin` (standard input). You have to explicitly tell the shell "this is a file path" using `./` (which means "current directory").

```bash
cat ./-

```

**Flag:** <span class="spoiler">rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi</span>

### Level 2 → 3 (Spaces in Filenames)

**Goal:** Read a file named `spaces in this filename`.
Spaces separate arguments in Bash. To tell Bash this is one single argument, we use quotes or escape characters.

```bash
cat "spaces in this filename"
# OR
cat spaces\ in\ this\ filename

```

**Flag:** <span class="spoiler">aBZ0W5EmUfAf7k76VKKJ7px84k5ePPRa</span>

---

## Levels 4-6: The Power of `find`

Now we stop looking at files and start _searching_ for them.

### Level 4 → 5

**Goal:** Find the only human-readable file in the `inhere` directory.
There are multiple files named `-file00`, `-file01`, etc. Most are binary garbage. We can use the `file` command to see the data type of every file at once.

```bash
file ./inhere/*

```

Look for the one that says `ASCII text`.

**Flag:** <span class="spoiler">4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw</span>

### Level 5 → 6

**Goal:** Find a file that is **1033 bytes**, **not executable**, and **owned by group bandit6**.
This is where `find` shines. We can filter by properties, not just names.

```bash
find . -type f -size 1033c ! -executable -group bandit6

```

_(Note: `1033c` means bytes. `1033k` would be kilobytes!)_

**Flag:** <span class="spoiler">HWasnPhtq9AVKe0dmk45nxy20cvUa6Cu</span>

### Level 6 → 7 (The Filter)

**Goal:** The file is somewhere on the server (not just in the current folder), owned by **user bandit7**, **group bandit6**, and **33 bytes** large.

This is the first real hurdle for many. You have to search the _entire_ drive (`/`), which means you are going to get thousands of "Permission Denied" errors from looking in folders you don't have access to.

If you just run the command, the flag will be buried in error messages. We need to redirect those errors (`stderr`, file descriptor 2) into the void (`/dev/null`).

```bash
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null

```

This command is a synthesis of three concepts:

1. **Scope:** Searching from root `/`.
2. **Filtering:** Combining user, group, and size flags.
3. **Stream Redirection:** Cleaning the output so only the success is visible.

**Flag:** <span class="spoiler">morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj</span>

---

## Levels 7-10: Text Wrangling

We found the files; now we need to process the text _inside_ them.

### Level 7 → 8

**Goal:** The password is next to the word "millionth".
We use `grep` (Global Regular Expression Print).

```bash
grep "millionth" data.txt

```

**Flag:** <span class="spoiler">dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc</span>

### Level 8 → 9

**Goal:** The password is the only line of text that occurs only once.
To find a unique line, we first need to sort them. Why? Because `uniq` only compares adjacent lines—it can't detect duplicates that are separated. Sorting brings all identical lines together.

```bash
sort data.txt | uniq -u

```

**Python Alternative:** If you want to see where Python becomes cleaner, here's how you could solve this with a one-liner:

```python
python3 -c "from collections import Counter; print([k for k,v in Counter(open('data.txt').readlines()).items() if v==1][0].strip())"
```

This uses Python's `Counter` to count occurrences without needing to sort first. For simple shell tasks, `sort | uniq` is faster to type, but when dealing with more complex data transformations, Python's data structures give you more power.

**Flag:** <span class="spoiler">4CKMh1JI91bUIZZPXDqGanal4xvAg0JM</span>

### Level 9 → 10

**Goal:** One of the few human-readable strings in a binary file, preceded by several `=` characters.
If you `cat` a binary file, you might crash your terminal. Use `strings` to pull out the text, then pipe it to grep.

```bash
strings data.txt | grep "==="

```

**Flag:** <span class="spoiler">FGUW5il8JNE7q19ksvT6E3RhhE5gQnwj</span>

### Level 10 → 11

**Goal:** The file contains base64 encoded data.
Base64 is not encryption; it's encoding. It's easily reversible.

```bash
base64 -d data.txt

```

**Flag:** <span class="spoiler">dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr</span>

---

## Conclusion

At this point, you aren't "hacking" yet. You're just administrating. But these skills are the foundation. If you can't filter a text stream or find a config file by its permissions, you can't escalate privileges.

Next time, we'll dive into **Level 11-20**, where we start dealing with networking, compression, and SSH keys.

---
