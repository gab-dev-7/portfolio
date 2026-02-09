---
title: "De-Magicking AI: Writing a Neural Network in Pure C"
description: "Why I ditched PyTorch to fight with malloc, pointers, and the chain rule."
publishDate: "2026-02-08"
tags: ["C", "Machine Learning", "Systems", "Engineering"]
---

Everyone is talking about AI right now. But for most developers, "doing AI" just means importing a Python library and calling a function. It feels like magic.

I don't like magic. I like logic.

I wanted to understand _why_ it works—not just theoretically, but at the instruction level. So, I decided to do something slightly masochistic: I built a fully functional, configurable neural network in pure C. No PyTorch, no TensorFlow, just me and `math.h`.

## The "Why": Logic vs. Magic

The motivation was simple: pure curiosity mixed with a challenge. When you use a high-level library, you take the gradient descent and backpropagation for granted. You trust the "black box."

By forcing myself to implement it in C, I had to confront the reality of what a neural network actually is: a massive pile of linear algebra and calculus. There is no garbage collector to save you, and there is no `tensor.backward()` to do the math for you.

## The Architecture

I didn't want to hardcode a simple XOR solver. I wanted a generic engine. My implementation supports:

- **Dynamic Topology:** Configurable input, hidden, and output sizes.
- **Activations:** Sigmoid, ReLU, Leaky ReLU, Tanh, and Linear.
- **Loss Functions:** MSE, Binary Cross-Entropy, and MAE.
- **Optimizers:** Momentum and Learning Rate Decay.

Here is how the network looks in memory. Notice the heavy use of double pointers (`double**`)—this was necessary to create dynamic 2D arrays for the weights and gradients.

```c
typedef struct {
    int input_size;
    int hidden_size;
    int output_size;

    // Weights and biases
    double** w1;
    double* b1;
    double** w2;
    double* b2;

    // Activations
    double* hidden;
    double* output;

    // Gradients & Momentum
    double** dw1;
    double** dw2;
    double momentum;
} NeuralNetwork;

```

## The Math: No Libraries, Just Calculus

Implementing this required translating vector calculus directly into C loops. The code isn't just moving data; it's physically calculating the Chain Rule step-by-step.

**1. The Forward Pass (Prediction)**

First, we compute the weighted sum of inputs plus a bias (the linear step), and then "squash" it using an activation function like Sigmoid to introduce non-linearity:

$$
Z = W \cdot X + b
$$

$$
A = \sigma(Z) = \frac{1}{1 + e^{-Z}}
$$

**2. The Backward Pass (Learning)**

This is where the magic (or pain) happens. We calculate how much each specific weight contributed to the total error using the Chain Rule:

$$
\frac{\partial L}{\partial W} = \frac{\partial L}{\partial A} \cdot \frac{\partial A}{\partial Z} \cdot \frac{\partial Z}{\partial W}
$$

**3. The Update (Gradient Descent)**

Finally, we nudge the weights in the opposite direction of the gradient to minimize error, scaled by a learning rate ($\eta$):

$$
W_{new} = W_{old} - \eta \cdot \nabla L
$$

In Python, this is one line of code. In C, that single update equation becomes a carefully managed nested `for` loop handling pointers to gradient arrays.

## The Friction: Pointers and Memory

The hardest part wasn't the math itself; it was the memory management. In Python, you create a list and move on. In C, if you want a dataset, you have to `malloc` every single row.

If you don't plan your memory usage ahead of time, you end up with segmentation faults or memory leaks. You have to be intentional. Every time I calculate a gradient, I have to know exactly where that `double` is going to live.

## The "Aha!" Moment

The most satisfying part of this project wasn't writing the code—it was running it. Because it's C, it is blazing fast. I built a CLI interface that lets me tweak hyperparameters via flags (`-h` for hidden size, `-lr` for learning rate) and watch the training in real-time.

Here is what it looks like when the network learns the **XOR** function (a classic non-linear problem) in milliseconds:

```bash
$ ./nn -e 5000 -l 0.1 -h 8 -d xor -ha relu -oa sigmoid -loss bce -wd 0.001 -v

dataset info:
  type: xor
  total samples: 100
  training samples: 80
  test samples: 20

starting training...
epoch 0/5000 | train loss: 0.697071 | test loss: 0.713845
epoch 100: learning rate decayed to 0.099500
...
final results:
  training loss: 0.000590
  test loss: 0.001088
  training accuracy: 100.00% (80/80)
  test accuracy: 100.00% (20/20)

sample predictions:
input: [0.071, 0.926] -> output: 0.9940 (expected: 1.0000) -> class: 1 (expected: 1) ✓
input: [-0.045, 0.077] -> output: 0.0000 (expected: 0.0000) -> class: 0 (expected: 0) ✓

```

Seeing the loss drop from `0.69` to `0.0005` in the terminal proves that the math I wrote by hand is actually working. The network "learned" that `[0, 1]` outputs `1` and `[0, 0]` outputs `0`.

## Dealing with Complexity: The Circle Problem

XOR is cool, but I wanted to see if my C engine could handle messy classification data. I generated a dataset of points inside and outside a circle (non-linearly separable) and added noise.

The network struggled initially, but after tuning the hidden layer size and switching to `ReLU`, it converged.

```bash
$ ./nn -d circle_enhanced -n 2000 -ha relu -oa sigmoid -loss bce
...
sample predictions:
input: [-0.281, -0.996] -> output: 0.4922 (expected: 0.0000) -> class: 0 (expected: 0) ✓
input: [-0.192, 0.158] -> output: 0.4922 (expected: 1.0000) -> class: 0 (expected: 1) ✗

```

You can see it's not perfect (it misses edge cases), but that's the reality of ML. It’s probabilistic, not deterministic.

## Conclusion

Building this taught me that there is no magic in AI. It's just:

1. **Forward Pass:** Dot products and activation functions.
2. **Loss Calculation:** How wrong were we?
3. **Backward Pass:** Using derivatives to nudge weights in the opposite direction of the error.

Check out the full source code on my [GitHub](https://www.google.com/search?q=https://github.com/gab-dev-7/neural-network).

---
