---
title: "求解函数表达式"
published: "2026-05-24"
dir: "函数"
---

# 根据函数对应法则求函数表达式

## 题型

### ① 已知 $f(x)$，求 $f[f(x)]$ 或已知 $f(x), g(x)$，求 $f[g(x)]$ → 直接代入法

**例1（2009）**  
已知 $f(x) = e^x$，$g(x) = \sin x$，求 $f[g(x)]$。  

解：  
∵ $f(x) = e^x$  
∴ $f[g(x)] = e^{g(x)} = e^{\sin x}$

---

**例2（2015）**  
设 $f(x) = \dfrac{1}{1-x}$，则 $f[f(x)] = ?$  

解：  
$$
f[f(x)] = \frac{1}{1 - f(x)} = \frac{1}{1 - \frac{1}{1-x}} = \frac{1}{\frac{(1-x)-1}{1-x}} = \frac{1}{\frac{-x}{1-x}} = -\frac{1-x}{x}
$$

---

### ② 已知 $f(\text{口}) = \triangle$，求 $f(x)$

#### 1）换元法

**步骤：**  
a. 令 $\text{口} = t$  
b. 由 $\text{口} = t$ 反解出 $x$  
c. 回代，化简得 $f(t)$，再将 $t$ 换为 $x$

**例**  
设 $f\!\left(\frac{1}{x} - 1\right) = \frac{x}{2x-1}$，求 $f(x)$。  

解：  
令 $\frac{1}{x} - 1 = t$，则 $\frac{1}{x} = t+1$，解得 $x = \frac{1}{t+1}$  

代入原式：  
$$
f(t) = \frac{\frac{1}{t+1}}{2\cdot\frac{1}{t+1} - 1}
= \frac{\frac{1}{t+1}}{\frac{2}{t+1} - 1}
= \frac{\frac{1}{t+1}}{\frac{2-(t+1)}{t+1}}
= \frac{1}{2-t-1}
= \frac{1}{1-t}
$$  
∴ $f(x) = \dfrac{1}{1-x}$

---

#### 2）配凑法

将右边凑成“口”的形式（常用三角恒等式、完全平方公式等）

**例**  
设 $f(\cos 2x) = \tan^2 x$，求 $f(x)$ 及 $f(2x)$。  

**分析**  
利用 $\cos 2x = 2\cos^2 x - 1 = 1 - 2\sin^2 x$，得  
$$
\sin^2 x = \frac{1 - \cos 2x}{2}, \quad \cos^2 x = \frac{1 + \cos 2x}{2}
$$  
因此  
$$
\tan^2 x = \frac{\sin^2 x}{\cos^2 x} = \frac{1 - \cos 2x}{1 + \cos 2x}
$$

**解**  
$$
f(\cos 2x) = \frac{1 - \cos 2x}{1 + \cos 2x}
$$  
令 $t = \cos 2x$，则  
$$
f(t) = \frac{1 - t}{1 + t}
$$  
所以  
$$
f(x) = \frac{1 - x}{1 + x}, \qquad f(2x) = \frac{1 - 2x}{1 + 2x}
$$