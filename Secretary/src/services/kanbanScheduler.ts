/**
 * Kanban调度测试v3
 *
 * 这个服务模拟Kanban风格的调度系统，用于测试orchestrator的调度能力
 */

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedHours?: number;
  actualHours?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: KanbanTask['status'];
  tasks: KanbanTask[];
  wipLimit?: number;
}

export class KanbanScheduler {
  private columns: KanbanColumn[] = [
    { id: 'todo', title: '待办', status: 'todo', tasks: [], wipLimit: Infinity },
    { id: 'in-progress', title: '进行中', status: 'in-progress', tasks: [], wipLimit: 3 },
    { id: 'review', title: '审核中', status: 'review', tasks: [], wipLimit: 2 },
    { id: 'done', title: '已完成', status: 'done', tasks: [], wipLimit: Infinity }
  ];

  private tasks: Map<string, KanbanTask> = new Map();
  private nextId = 1;

  /**
   * 创建新任务
   */
  createTask(taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt' | 'status'>): KanbanTask {
    const task: KanbanTask = {
      ...taskData,
      id: `task_${this.nextId++}`,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    this.getColumn('todo').tasks.push(task);

    return task;
  }

  /**
   * 移动任务到不同状态列
   */
  moveTask(taskId: string, targetStatus: KanbanTask['status']): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    const sourceColumn = this.getColumn(task.status);
    const targetColumn = this.getColumn(targetStatus);

    // 检查WIP限制
    if (targetColumn.wipLimit && targetColumn.tasks.length >= targetColumn.wipLimit) {
      return false;
    }

    // 从原列移除
    sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskId);

    // 更新任务状态并添加到目标列
    task.status = targetStatus;
    task.updatedAt = new Date();
    targetColumn.tasks.push(task);

    return true;
  }

  /**
   * 获取所有列状态
   */
  getBoardState(): KanbanColumn[] {
    return this.columns.map(column => ({
      ...column,
      tasks: [...column.tasks] // 返回副本
    }));
  }

  /**
   * 获取特定列
   */
  getColumn(status: KanbanTask['status']): KanbanColumn {
    const column = this.columns.find(col => col.status === status);
    if (!column) throw new Error(`Column with status ${status} not found`);
    return column;
  }

  /**
   * 更新任务信息
   */
  updateTask(taskId: string, updates: Partial<KanbanTask>): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    Object.assign(task, { ...updates, updatedAt: new Date() });
    return true;
  }

  /**
   * 获取任务统计信息
   */
  getStatistics() {
    const totalTasks = this.tasks.size;
    const completedTasks = this.getColumn('done').tasks.length;
    const inProgressTasks = this.getColumn('in-progress').tasks.length;
    const todoTasks = this.getColumn('todo').tasks.length;

    const totalEstimatedHours = Array.from(this.tasks.values())
      .reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

    const totalActualHours = Array.from(this.tasks.values())
      .reduce((sum, task) => sum + (task.actualHours || 0), 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalEstimatedHours,
      totalActualHours,
      efficiency: totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0
    };
  }

  /**
   * 模拟调度器运行 - 自动推进任务
   */
  runScheduler(): string[] {
    const actions: string[] = [];

    // 自动推进已完成的任务
    const reviewTasks = this.getColumn('review').tasks.slice(); // 创建副本避免在迭代中修改
    reviewTasks.forEach(task => {
      if (this.moveTask(task.id, 'done')) {
        actions.push(`任务 "${task.title}" 从审核中移动到已完成`);
      }
    });

    // 自动推进进行中的任务到审核
    const inProgressTasks = this.getColumn('in-progress').tasks.slice(); // 创建副本避免在迭代中修改
    inProgressTasks.forEach(task => {
      if (this.moveTask(task.id, 'review')) {
        actions.push(`任务 "${task.title}" 从进行中移动到审核中`);
      }
    });

    // 自动从待办中拉取任务到进行中（如果WIP允许）
    const todoTasks = this.getColumn('todo').tasks.slice(); // 创建副本避免在迭代中修改
    const inProgressLimit = this.getColumn('in-progress').wipLimit || Infinity;
    const currentInProgress = this.getColumn('in-progress').tasks.length;

    if (currentInProgress < inProgressLimit && todoTasks.length > 0) {
      const taskToPull = todoTasks[0];
      if (this.moveTask(taskToPull.id, 'in-progress')) {
        actions.push(`任务 "${taskToPull.title}" 从待办移动到进行中`);
      }
    }

    return actions;
  }
}
