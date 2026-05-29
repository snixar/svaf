---
title: "常见的基本初等函数"
published: "2026-05-24"
dir: "函数"
---

# 常见的基本初等函数

## ① 常数函数
$$y = c \quad (c \text{为任意常数})$$

## ② 幂函数
$$y = x^a$$
常见形式：$y = x$，$y = x^2$，$y = x^3$，$y = \sqrt{x} = x^{1/2}$

### 幂运算公式
- $x^a \cdot x^b = x^{a+b}$
- $\dfrac{x^a}{x^b} = x^{a-b}$
- $\sqrt[b]{x} = x^{a/b}$（此处应为 $\sqrt[b]{x^a} = x^{a/b}$，原笔记表述略简）
- $x^{-a} = \dfrac{1}{x^a}$

## ③ 指数函数
$$y = a^x \quad (a > 0, a \neq 1)$$
自然指数函数：$y = e^x$，其中 $e \approx 2.718$

## ④ 对数函数
$$y = \log_a x \quad \Leftrightarrow \quad x = a^y$$
自然对数：$\ln x = \log_e x$，即 $y = \ln x \Leftrightarrow x = e^y$

### 对数运算公式
- $\ln a + \ln b = \ln(ab)$
- $\ln a - \ln b = \ln\left(\dfrac{a}{b}\right)$
- $\ln(a^b) = b \ln a$
- $u^v = e^{v \ln u}$（幂指函数转换）

## 三角函数

### 常用三角函数关系（勾股定理：$a^2 + b^2 = c^2$）
设直角三角形中，$\sin x = \dfrac{b}{c}$，$\cos x = \dfrac{a}{c}$，$\tan x = \dfrac{\sin x}{\cos x}$，$\cot x = \dfrac{\cos x}{\sin x}$  
$\tan x = \dfrac{b}{a}$，$\cot x = \dfrac{a}{b}$，$\tan x = \dfrac{1}{\cot x}$（或 $\cot x = \dfrac{1}{\tan x}$）  
$\sec x = \dfrac{1}{\cos x}$，$\csc x = \dfrac{1}{\sin x}$

### 常用三角函数值
| 角度 $x$ | $\sin x$ | $\cos x$ | $\tan x$ |
|----------|----------|----------|----------|
| $0$      | $0$      | $1$      | $0$      |
| $\frac{\pi}{6}$ | $\frac{1}{2}$ | $\frac{\sqrt{3}}{2}$ | $\frac{\sqrt{3}}{3}$ |
| $\frac{\pi}{4}$ | $\frac{\sqrt{2}}{2}$ | $\frac{\sqrt{2}}{2}$ | $1$ |
| $\frac{\pi}{3}$ | $\frac{\sqrt{3}}{2}$ | $\frac{1}{2}$ | $\sqrt{3}$ |
| $\frac{\pi}{2}$ | $1$      | $0$      | 不存在    |

### 常用反三角函数值
- $\arctan 1 = \dfrac{\pi}{4}$
- $\arcsin 1 = \dfrac{\pi}{2}$
- $\arccos 0 = \dfrac{\pi}{2}$
- $\arctan 0 = 0$
- $\arctan \sqrt{3} = \dfrac{\pi}{3}$

### 常用三角恒等式

**平方关系**
- $\sin^2 x + \cos^2 x = 1$
- $1 + \tan^2 x = \sec^2 x$
- $1 + \cot^2 x = \csc^2 x$

**二倍角公式**
- $\sin 2x = 2 \sin x \cos x$
- $\cos 2x = \cos^2 x - \sin^2 x = 2\cos^2 x - 1 = 1 - 2\sin^2 x$

**降幂公式**
- $\cos^2 x = \dfrac{1 + \cos 2x}{2}$
- $\sin^2 x = \dfrac{1 - \cos 2x}{2}$

**常用变形**
- $\dfrac{1}{1 + \cos x} = \dfrac{1 - \cos x}{\sin^2 x}$（因为 $(1+\cos x)(1-\cos x)=1-\cos^2 x=\sin^2 x$）
- $\sec^2 x = \dfrac{1}{\cos^2 x}$

### 乘法公式
- 平方差：$(a+b)(a-b)=a^2-b^2$
- 完全平方：$(a \pm b)^2 = a^2 \pm 2ab + b^2$
- 立方和/差：$a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2)$