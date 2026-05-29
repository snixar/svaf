---
title: "极限及其四则运算"
published: "2026-05-29"
dir: "极限"
---

# 极限的概念与运算法则

## ① 函数极限
## ② 数列极限

## ③ 左右极限

- 左极限：$x \to x_0^-$ 时 $f(x)$ 的极限  
- 右极限：$x \to x_0^+$ 时 $f(x)$ 的极限

## ④ 极限存在的充要条件

左右极限存在且相等：
$$ \lim_{x \to x_0} f(x) = L \quad \iff \quad \lim_{x \to x_0^-} f(x) = \lim_{x \to x_0^+} f(x) = L $$

## ⑤ 注

$f(x)$ 在某点 $x_0$ 处的极限值与 $f(x)$ 在该点是否有定义、或 $f(x_0)$ 的值 **无关**。

---

# 函数极限的计算 ⇔ 四则运算法则

设 $\lim f(x) = A$，$\lim g(x) = B$，则：

$$
\begin{aligned}
& \text{① } \lim [f(x) \pm g(x)] = \lim f(x) \pm \lim g(x) = A \pm B \\[4pt]
& \text{② } \lim [f(x) \cdot g(x)] = \lim f(x) \cdot \lim g(x) = A \cdot B \\[4pt]
& \text{③ } \lim \frac{f(x)}{g(x)} = \frac{\lim f(x)}{\lim g(x)} = \frac{A}{B} \quad (B \neq 0)
\end{aligned}
$$

**注**：以上运算法则成立的前提是各极限存在（分母极限不为零）。