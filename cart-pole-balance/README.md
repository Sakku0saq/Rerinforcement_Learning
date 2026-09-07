# CartPole Reinforcement Learning Demo 

An interactive **Reinforcement Learning (RL)** project that demonstrates how an agent can learn to balance a pole on a moving cart using the classic **CartPole-v1** environment.

The project includes:

*  A Jupyter Notebook for experimenting with the CartPole environment using Gymnasium.
*  An interactive browser-based CartPole simulation.
*  Live visualization of episode rewards and policy improvement.
*  A simple policy-based reinforcement learning approach.

---

##  Project Overview

CartPole is one of the most popular introductory problems in Reinforcement Learning.

The objective is simple:

> Keep the pole balanced for as long as possible by moving the cart left or right.

At every step, the agent observes the current state of the environment and chooses one of two possible actions:

*  Move the cart left
*  Move the cart right

The agent receives a reward for every timestep that the pole remains balanced.

The episode ends when:

* The pole falls beyond the allowed angle.
* The cart moves too far from the center.
* The maximum number of steps is reached.

---

##  Reinforcement Learning Concepts

The CartPole environment contains the following important RL components.

### Observation Space

The agent receives four values representing the current environment state:

```text
[cart position,
 cart velocity,
 pole angle,
 pole angular velocity]
```

These observations are used by the policy to determine the next action.

### Action Space

There are two discrete actions:

```text
0 → Push cart left
1 → Push cart right
```

### Reward

The agent receives:

```text
+1 reward for every timestep the pole remains balanced
```

The longer the pole stays upright, the higher the total episode reward.

---

##  Project Structure

```text
├── Reinforcement_Learning.ipynb
│   └── Jupyter Notebook demonstrating CartPole with Gymnasium
│
├── cartpole-rl-demo.html
│   └── Interactive browser-based CartPole reinforcement learning demo
│
└── README.md
```

---

##  Jupyter Notebook

The notebook introduces the **CartPole-v1** environment and demonstrates how to interact with it using Gymnasium.

The workflow includes:

1. Creating the CartPole environment.
2. Resetting the environment.
3. Observing the state.
4. Taking actions.
5. Receiving rewards.
6. Detecting episode termination.
7. Implementing a simple policy.

### Creating the Environment

```python
import gymnasium as gym

env = gym.make(
    "CartPole-v1",
    render_mode="rgb_array"
)
```

### Resetting the Environment

```python
obs, info = env.reset(seed=42)
```

### Taking an Action

```python
action = 1

obs, reward, done, truncated, info = env.step(action)
```

---

##  Basic Policy

The notebook implements a simple rule-based policy based on the pole angle.

```python
def basic_policy(obs):
    angle = obs[2]
    return 0 if angle < 0 else 1
```

The policy checks the pole's angle and selects a direction for the cart.

The policy is then evaluated over multiple episodes to measure its performance.

Example evaluation metrics include:

* Mean reward
* Standard deviation
* Minimum reward
* Maximum reward

```python
import numpy as np

np.mean(totals)
np.std(totals)
min(totals)
max(totals)
```

---

#  Interactive Web Demo

The project also includes a standalone interactive CartPole simulation built with:

* HTML
* CSS
* Vanilla JavaScript
* Canvas API
* Chart.js

The simulation runs entirely in the browser.

No backend or server is required.

---

##  Features

### Live CartPole Simulation

Watch the cart and pole move in real time as the policy attempts to keep the pole balanced.

### Episode Tracking

The interface displays:

* Current episode number
* Current episode reward
* Best reward achieved

### Learning Visualization

A live chart displays the moving average of episode rewards.

This makes it easier to observe whether the policy is improving over time.

### Speed Control

Users can control the simulation speed using the speed slider.

### Pause and Play

The simulation can be paused and resumed at any time.

---

##  How the Learning Process Works

The browser demo follows a simple policy-improvement loop:

### 1. Observe 

The agent reads the current state:

* Cart position
* Cart velocity
* Pole angle
* Pole angular velocity

### 2. Act 

A linear policy calculates an action using the current observation and a set of weights.

```text
Observation × Policy Weights → Action
```

The cart is then pushed left or right.

### 3. Receive Reward 

Every timestep that the pole remains balanced contributes to the episode reward.

### 4. Update 

The policy weights are slightly modified.

If the new policy performs better than the previous best policy, the new weights are kept.

Otherwise, they are discarded.

This approach is a form of:

> **Hill Climbing / Random Search**

The learning process does not use:

* Neural networks
* Backpropagation
* Gradients

Instead, it repeatedly:

```text
Propose → Evaluate → Keep Improvements
```

---

##  CartPole Physics

The simulation models the standard CartPole dynamics using:

* Gravity
* Cart mass
* Pole mass
* Pole length
* Applied force
* Angular acceleration
* Cart acceleration

The environment state is continuously updated using physics equations.

The episode terminates when the cart or pole exceeds the defined limits.

---

##  Installation and Usage

### Option 1: Run the Jupyter Notebook

Install the required dependencies:

```bash
pip install gymnasium
```

For classic control environments:

```bash
pip install gymnasium[classic_control]
```

Then launch Jupyter Notebook:

```bash
jupyter notebook
```

Open:

```text
Reinforcement_Learning.ipynb
```

---

### Option 2: Run the Web Demo

Simply open the following file in your web browser:

```text
cartpole-rl-demo.html
```

No backend setup is required.

---

##  Technologies Used

| Technology       | Purpose                            |
| ---------------- | ---------------------------------- |
| Python           | Reinforcement Learning experiments |
| Gymnasium        | CartPole environment               |
| NumPy            | Performance analysis               |
| Jupyter Notebook | Interactive experimentation        |
| HTML             | Web application structure          |
| CSS              | User interface styling             |
| JavaScript       | Simulation and learning logic      |
| Canvas API       | CartPole visualization             |
| Chart.js         | Reward visualization               |

---

##  Learning Objective

This project is designed as an introduction to:

* Reinforcement Learning
* Markov Decision Processes
* Observation spaces
* Action spaces
* Rewards
* Episodes
* Policies
* Environment interaction
* Policy improvement
* CartPole dynamics

---

##  Possible Improvements

Future versions of this project could include:

*  Deep Q-Learning (DQN)
*  PyTorch implementation
*  Neural network policies
*  Advanced reward analytics
*  Saving and loading trained models
*  Manual keyboard controls
*  Comparison of multiple RL algorithms
*  Training performance benchmarks

---

##  References

* Gymnasium
* CartPole-v1 environment
* Reinforcement Learning fundamentals
* Classic control theory

---

##  Author

Created as a Reinforcement Learning learning project focused on understanding the **CartPole balancing problem** and basic policy improvement techniques.

---

##  Conclusion

This project provides a practical introduction to Reinforcement Learning by combining:

* A Python-based CartPole experiment
* A simple rule-based policy
* An interactive browser simulation
* Live reward visualization
* A lightweight hill-climbing learning method

It is a beginner-friendly project for understanding how an agent interacts with an environment and improves its behavior through rewards and repeated experimentation.

**Happy Learning! **
