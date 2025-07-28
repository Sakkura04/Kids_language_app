import matplotlib.pyplot as plt
import numpy as np

# Tasks definition with corrected start and end months
tasks = {
    "Systematic Review (SR)": (1, 1),
    "Submission SR": (3, 4),
    "Topics for Theses": (1, 1),
    "Design Ideas": (4, 4),
    "Design MVPS": (4, 4),
    "Data Analysis": (5, 5),
    "Prototype Selection": (5, 5),
    "System Development": (5, 7),
    "System Evaluation Functionality": (8, 8),
    "Experiment Design for Assessment": (9, 10),
    "Assessment (2 mo)": (11, 12),
    "Analysis": (13, 13),
    "Theses Defense": (14, 14),  # Adjusted to Dec 2024 only
    "Thesis Formal Writing": (13, 14),  # Adjusted to Nov to Dec 2024
    "Committee Formation": (1, 1),
    "Committee Meetings": (3, 3, 7, 7, 11, 11),
}

# Corrected months labels
months_labels = [
    "Fall '23",
    "Dec '23",
    "Jan '24",
    "Feb '24",
    "Mar '24",
    "Apr '24",
    "May '24",
    "Jun '24",
    "Jul '24",
    "Aug '24",
    "Sep '24",
    "Oct '24",
    "Nov '24",
    "Dec '24",
]

# Convert tasks into plot-ready format
task_names = list(tasks.keys())
start_times = []
durations = []

for task, times in tasks.items():
    if len(times) == 2:  # Single span tasks
        start_times.append(times[0])
        durations.append(times[1] - times[0] + 1)
    else:  # Tasks with multiple spans
        for i in range(0, len(times), 2):
            # task_names.append(task + " cont.")  # Mark continued tasks
            start_times.append(times[i])
            durations.append(times[i + 1] - times[i] + 1)

# Adjust for the actual list of tasks to match with start_times and durations
task_names_adjusted = task_names[: len(start_times)]

fig, ax = plt.subplots(figsize=(15, 10))

# Correcting the Committee Meetings entry to ensure proper iteration
tasks["Committee Meetings"] = [
    (3, 3),
    (8, 8),
    (11, 11),
    (8, 8),
]  # Adding tuples for start and end months

# Determine the current month index
current_month_index = 4  # February ('Feb '24')

for i, (task, times) in enumerate(tasks.items()):
    if isinstance(times[0], tuple):  # Check if the task has multiple spans
        for time in times:
            start, end = time
            # Assign color based on the task's timeline
            color = (
                "red"
                if start > current_month_index
                else ("orange" if start == current_month_index else "blue")
            )
            ax.broken_barh([(start, end - start + 1)], (i - 0.4, 0.8), facecolors=color)
    else:  # Single span tasks
        start, end = times
        color = (
            "red"
            if start > current_month_index
            else ("orange" if start == current_month_index else "blue")
        )
        ax.broken_barh([(start, end - start + 1)], (i - 0.4, 0.8), facecolors=color)

# Setting y-axis with task names
ax.set_yticks(range(len(tasks)))
ax.set_yticklabels(tasks.keys())
ax.invert_yaxis()  # Invert y-axis for top-down view

# Setting x-axis with the corrected months
ax.set_xticks(np.arange(1, len(months_labels) + 1))
ax.set_xticklabels(months_labels, rotation=45)
ax.set_xlabel("Months")
ax.set_title("Gantt Chart Timeline")

# Show grid and layout adjustments
ax.grid(True)
plt.tight_layout()
plt.show()
