import { KanbanScheduler } from './services/kanbanScheduler';

const scheduler = new KanbanScheduler();

// 创建一些任务
const task1 = scheduler.createTask({
  title: '任务1',
  description: '任务1描述',
  priority: 'high',
  estimatedHours: 3
});

const task2 = scheduler.createTask({
  title: '任务2',
  description: '任务2描述',
  priority: 'medium',
  estimatedHours: 2
});

console.log('Initial state:');
console.log('Todo:', scheduler.getColumn('todo').tasks.map(t => t.title));
console.log('In Progress:', scheduler.getColumn('in-progress').tasks.map(t => t.title));
console.log('Review:', scheduler.getColumn('review').tasks.map(t => t.title));
console.log('Done:', scheduler.getColumn('done').tasks.map(t => t.title));

// 手动移动一些任务到不同状态
scheduler.moveTask(task1.id, 'in-progress');
console.log('\nAfter moving task1 to in-progress:');
console.log('Todo:', scheduler.getColumn('todo').tasks.map(t => t.title));
console.log('In Progress:', scheduler.getColumn('in-progress').tasks.map(t => t.title));
console.log('Review:', scheduler.getColumn('review').tasks.map(t => t.title));
console.log('Done:', scheduler.getColumn('done').tasks.map(t => t.title));

scheduler.moveTask(task2.id, 'review');
console.log('\nAfter moving task2 to review:');
console.log('Todo:', scheduler.getColumn('todo').tasks.map(t => t.title));
console.log('In Progress:', scheduler.getColumn('in-progress').tasks.map(t => t.title));
console.log('Review:', scheduler.getColumn('review').tasks.map(t => t.title));
console.log('Done:', scheduler.getColumn('done').tasks.map(t => t.title));

// 运行调度器
const actions = scheduler.runScheduler();
console.log('\nActions:', actions);

console.log('\nFinal state:');
console.log('Todo:', scheduler.getColumn('todo').tasks.map(t => t.title));
console.log('In Progress:', scheduler.getColumn('in-progress').tasks.map(t => t.title));
console.log('Review:', scheduler.getColumn('review').tasks.map(t => t.title));
console.log('Done:', scheduler.getColumn('done').tasks.map(t => t.title));
