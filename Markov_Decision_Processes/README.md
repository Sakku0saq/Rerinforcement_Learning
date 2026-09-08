# Markov Decision Process (MDP) Interactive Simulator

An interactive web-based simulator designed to help understand the fundamental concepts of **Markov Decision Processes (MDPs)** used in **Reinforcement Learning**.

The application provides a visual and interactive way to explore how an agent makes decisions based on **states, actions, rewards, transition probabilities, and policies**.

---

## 📌 Overview

A **Markov Decision Process (MDP)** is a mathematical framework used to model sequential decision-making problems.

An MDP consists of:

- **States (S)** – The possible situations an agent can be in.
- **Actions (A)** – The possible decisions an agent can take.
- **Transition Probabilities (P)** – The probability of moving from one state to another.
- **Rewards (R)** – Feedback received after performing an action.
- **Policy (π)** – A strategy that determines which action the agent should take.

This simulator helps visualize and interact with these concepts in an intuitive way.

---

## 🧠 Markov Decision Process

An MDP can be represented as:

\[
MDP = (S, A, P, R, \gamma)
\]

Where:

| Symbol | Meaning |
|--------|---------|
| **S** | Set of states |
| **A** | Set of actions |
| **P** | State transition probabilities |
| **R** | Reward function |
| **γ** | Discount factor |

The goal of a Reinforcement Learning agent is to learn an optimal policy that maximizes the expected cumulative reward.

---

## ✨ Features

- Interactive visualization of Markov Decision Processes
- Understanding of states and actions
- Reward-based decision-making
- State transitions
- Policy visualization
- Interactive learning environment
- Beginner-friendly explanation of MDP concepts
- Modern web-based user interface

---

## 🛠️ Technologies Used

- **React**
- **TypeScript**
- **Vite**
- **HTML**
- **CSS**

---

## 📂 Project Structure

```text
Markov_Decision_Processes/
│
├── public/                 # Static files
│
├── src/                    # Application source code
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Application styling
│
├── .env.example            # Environment variable example
├── .gitignore              # Git ignored files
├── index.html              # Main HTML file
├── metadata.json           # Project metadata
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
