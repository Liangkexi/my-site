---
title: "公式汇总"
slug: "key-formulas"
order: 0
part: "附录"
book: "系统集成项目管理工程师教程（第3版）"
exam: "软考-系统集成项目管理工程师"
---

# 公式汇总

## 一、信息论基础（第1章）

### 香农熵公式
$$H = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$

- H：消除系统不确定性所需的信息量（负熵，单位bit）
- $P(x_i)$：第i个状态出现的概率

## 二、进度管理（第11章）

### 三点估算（PERT）
$$t_E = \frac{t_O + 4t_M + t_P}{6}$$

$$\sigma = \frac{t_P - t_O}{6}$$

- $t_O$：乐观时间
- $t_M$：最可能时间
- $t_P$：悲观时间
- $t_E$：期望时间
- $\sigma$：标准差

## 三、成本管理 / 挣值管理（第13章）

### 核心挣值公式

| 缩写 | 全称 | 含义 |
|------|------|------|
| **PV** | Planned Value | 计划价值（计划完成工作的预算） |
| **EV** | Earned Value | 挣值（实际完成工作的预算） |
| **AC** | Actual Cost | 实际成本（实际花费） |
| **BAC** | Budget at Completion | 完工预算（总预算） |

### 偏差分析
$$SV = EV - PV$$
> SV > 0 进度超前，SV < 0 进度滞后

$$CV = EV - AC$$
> CV > 0 成本节约，CV < 0 成本超支

### 绩效指数
$$SPI = \frac{EV}{PV}$$
> SPI > 1 进度超前，SPI < 1 进度滞后

$$CPI = \frac{EV}{AC}$$
> CPI > 1 成本节约，CPI < 1 成本超支

### 预测公式
$$EAC = AC + (BAC - EV)$$
> 剩余工作按预算完成（默认公式，非典型偏差）

$$EAC = \frac{BAC}{CPI}$$
> 按当前CPI继续（典型偏差）

$$EAC = AC + \frac{BAC - EV}{CPI \times SPI}$$
> 考虑CPI和SPI双重影响

$$ETC = EAC - AC$$
> 完工尚需估算

$$TCPI = \frac{BAC - EV}{BAC - AC}$$
> 完工尚需绩效指数（按原预算）

$$TCPI = \frac{BAC - EV}{EAC - AC}$$
> 完工尚需绩效指数（按新估算）

$$VAC = BAC - EAC$$
> 完工偏差

## 四、沟通管理（第11章）

### 沟通渠道数
$$N = \frac{n(n-1)}{2}$$

- n：项目干系人数量（含项目经理）

## 五、决策树分析 / EMV（第11章）

$$EMV = P \times I$$

- EMV：期望货币价值
- P：概率
- I：影响（货币金额）

## 六、自制或外购分析（第11章）

租赁 vs 购买判断：
$$\text{租赁总成本} = \text{日租金} \times \text{天数}$$
$$\text{购买总成本} = \text{购买价} + \text{维护费} \times \text{天数}$$
> 比较两者，选择成本低的方案

## 七、挣值计算速记口诀

> **"EV在上，PV在下"**
> - SV = EV - PV，CV = EV - AC
> - SPI = EV/PV，CPI = EV/AC
> - 大于1/大于0 = 好（进度超前/成本节约）

> **"非典BAC减EV"**：非典型偏差 EAC = AC + (BAC - EV)
> **"典除CPI"**：典型偏差 EAC = BAC/CPI

> 出处：原教材第1、11、13章
