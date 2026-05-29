---
title: "具体函数求定义域"
published: "2026-05-16"
dir: "函数"
---

## 具体函数
知道函数具体函数表达式，如 $y = x + 1$

## 掌握常见具体函数定义域

1. $y = \frac{1}{x}$，$x \neq 0$
2. $y = \sqrt[2n]{x}$，$x \geq 0$
3. $y = \sqrt[2n+1]{x}$，$x \in (-\infty, +\infty)$
4. $y = \log_a x$，$x > 0$；$\ln x$，$x > 0$
5. $y = \tan x$，$x \neq k\pi + \frac{\pi}{2}$
6. $y = \cot x$，$x \neq k\pi$
7. $y = \arctan x$，$y = \operatorname{arccot} x$，$x \in \mathbb{R}$（即 $x \in (-\infty, +\infty)$）
8. $y = \arcsin x$，$y = \arccos x$，$x \in [-1, 1]$

## 注意：整体思想

将 $x$ 替换为“口”，例如：
- $\frac{1}{x} \Rightarrow x \neq 0$
- $\frac{1}{x^2} \Rightarrow x^2 \neq 0$
- $\frac{1}{2x-1} \Rightarrow 2x-1 \neq 0$

一般规则：
- $\sqrt{\text{口}} \Rightarrow \text{口} \geq 0$
- $\frac{1}{\text{口}} \Rightarrow \text{口} \neq 0$

---

## 例题

### 例1
求 $y = \sqrt{2x+1}$ 的定义域。

**解：**
$$
2x + 1 \geq 0
$$
$$
2x \geq -1
$$
$$
x \geq -\frac{1}{2}
$$
所以定义域为 $x \in \left[-\frac{1}{2}, +\infty\right)$。

---

### 例2
求 $y = \frac{1}{2x^2 - x - 1}$ 的定义域。

**解：**
$$
2x^2 - x - 1 \neq 0
$$
因式分解：
$$
(2x - 1)(x + 1) \neq 0
$$
$$
2x - 1 \neq 0 \quad \Rightarrow \quad x \neq \frac{1}{2}
$$
$$
x + 1 \neq 0 \quad \Rightarrow \quad x \neq -1
$$
所以定义域为 $x \neq \frac{1}{2}$ 且 $x \neq -1$。

#### 二次函数补充
1. **求根公式**：
   $$
   y = ax^2 + bx + c = 0 \quad \Rightarrow \quad x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
   $$
2. **十字相乘**：
   $$
   x^2 + (a+b)x + ab = (x+a)(x+b)
   $$
3. **完全平方和差**：
   $$
   (a+b)^2 = a^2 + 2ab + b^2
   $$

---

### 例3
求 $y = \frac{\sqrt{2x+1}}{2x^2 - x - 1}$ 的定义域。

**解：**
① 分子根式：
$$
2x + 1 \geq 0 \quad \Rightarrow \quad x \geq -\frac{1}{2}
$$
② 分母不为零：
$$
2x^2 - x - 1 \neq 0 \quad \Rightarrow \quad x \neq -\frac{1}{2} \text{ 且 } x \neq 1
$$
综合得：
$$
x \in \left(-\frac{1}{2}, 1\right) \cup (1, +\infty)
$$

---

### 例4（2018-4）
求 $y = \frac{1}{\sin x} + \sqrt{1 - x^2}$ 的定义域。（ ）

A. $(-1, 1]$  B. $(-1, 1)$  C. $[-1, 0) \cup (0, 1]$  D. $(-1, 0) \cup (0, 1)$

**解：**
① $\sin x \neq 0 \Rightarrow x \neq k\pi$，在区间上即 $x \neq 0$。  
② $1 - x^2 \geq 0 \Rightarrow x^2 \leq 1 \Rightarrow -1 \leq x \leq 1$。

综合得定义域为 $[-1, 0) \cup (0, 1]$，故选 **C**。

> 注：$x^2 \leq b \Rightarrow -\sqrt{b} \leq x \leq \sqrt{b}$。