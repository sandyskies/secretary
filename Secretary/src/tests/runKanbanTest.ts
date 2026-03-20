import { KanbanScheduler } from '../services/kanbanScheduler';

/**
 * Kanban调度测试v2 - 测试运行器
 *
 * 这个文件运行Kanban调度器的测试，用于验证orchestrator的调度能力
 */

console.log('🚀 开始Kanban调度测试v2...\n');

function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   错误: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// 测试1: 基本任务创建
const test1 = runTest('任务创建功能', () => {
  const scheduler = new KanbanScheduler();
  const task = scheduler.createTask({
    title: '测试任务创建',
    description: '验证任务创建功能',
    priority: 'high',
    estimatedHours: 2
  });

  if (!task.id) throw new Error('任务ID未生成');
  if (task.title !== '测试任务创建') throw new Error('任务标题不正确');
  if (task.status !== 'todo') throw new Error('任务状态不正确');
});

// 测试2: 任务移动
const test2 = runTest('任务移动功能', () => {
  const scheduler = new KanbanScheduler();
  const task = scheduler.createTask({
    title: '移动测试任务',
    description: '验证任务移动功能',
    priority: 'medium'
  });

  const result = scheduler.moveTask(task.id, 'in-progress');
  if (!result) throw new Error('任务移动失败');

  const board = scheduler.getBoardState();
  const inProgressColumn = board.find(col => col.status === 'in-progress');
  if (!inProgressColumn || inProgressColumn.tasks.length !== 1) {
    throw new Error('任务未正确移动到进行中列');
  }
});

// 测试3: WIP限制
const test3 = runTest('WIP限制功能', () => {
  const scheduler = new KanbanScheduler();
  // 填满进行中列（WIP限制为3）
  for (let i = 1; i <= 3; i++) {
    const task = scheduler.createTask({
      title: `WIP测试任务${i}`,
      description: '测试WIP限制',
      priority: 'low'
    });
    scheduler.moveTask(task.id, 'in-progress');
  }

  // 尝试添加第4个任务应该失败
  const task4 = scheduler.createTask({
    title: 'WIP测试任务4',
    description: '测试WIP限制失败情况',
    priority: 'low'
  });

  const result = scheduler.moveTask(task4.id, 'in-progress');
  if (result) throw new Error('WIP限制未生效');

  const board = scheduler.getBoardState();
  const inProgressColumn = board.find(col => col.status === 'in-progress');
  if (inProgressColumn?.tasks.length !== 3) {
    throw new Error('WIP限制未正确执行');
  }
});

// 测试4: 调度器自动运行
const test4 = runTest('调度器自动运行', () => {
  const scheduler = new KanbanScheduler();
  // 创建一些任务
  const task1 = scheduler.createTask({
    title: '自动调度任务1',
    description: '测试自动调度',
    priority: 'high',
    estimatedHours: 4
  });

  const task2 = scheduler.createTask({
    title: '自动调度任务2',
    description: '测试自动调度',
    priority: 'medium',
    estimatedHours: 2
  });

  // 手动设置一些任务状态
  scheduler.moveTask(task1.id, 'in-progress');
  scheduler.moveTask(task2.id, 'review');

  // 运行调度器
  const actions = scheduler.runScheduler();

  if (actions.length === 0) throw new Error('调度器未执行任何操作');

  // 验证任务状态变化 - 任务2应该从review移动到done
  const board = scheduler.getBoardState();
  const doneColumn = board.find(col => col.status === 'done');
  const reviewColumn = board.find(col => col.status === 'review');
  const inProgressColumn = board.find(col => col.status === 'in-progress');

  // 任务2应该从review移动到done
  if (!doneColumn || doneColumn.tasks.length < 1) {
    throw new Error('任务未正确移动到已完成列');
  }

  // 任务1应该从in-progress移动到review
  if (!reviewColumn || reviewColumn.tasks.length < 1) {
    throw new Error('任务未正确移动到审核列');
  }

  // 验证具体的任务移动
  const movedToDone = doneColumn.tasks.some(task => task.title === '自动调度任务2');
  const movedToReview = reviewColumn.tasks.some(task => task.title === '自动调度任务1');

  if (!movedToDone) throw new Error('任务2未移动到已完成列');
  if (!movedToReview) throw new Error('任务1未移动到审核列');
});

// 测试5: 统计功能
const test5 = runTest('统计功能', () => {
  const scheduler = new KanbanScheduler();

  // 创建一些任务来测试统计功能
  scheduler.createTask({ title: '统计任务1', description: '测试统计', priority: 'high', estimatedHours: 5 });
  scheduler.createTask({ title: '统计任务2', description: '测试统计', priority: 'medium', estimatedHours: 3 });

  const task3 = scheduler.createTask({ title: '统计任务3', description: '测试统计', priority: 'low', estimatedHours: 2 });
  scheduler.moveTask(task3.id, 'in-progress');

  const task4 = scheduler.createTask({ title: '统计任务4', description: '测试统计', priority: 'medium', estimatedHours: 4 });
  scheduler.moveTask(task4.id, 'done');

  const stats = scheduler.getStatistics();

  if (stats.totalTasks === 0) throw new Error('统计信息不正确');
  if (stats.completionRate < 0 || stats.completionRate > 100) {
    throw new Error('完成率计算错误');
  }

  console.log(`   统计信息: 总任务=${stats.totalTasks}, 完成率=${stats.completionRate.toFixed(1)}%`);
});

// 测试6: 任务更新
const test6 = runTest('任务更新功能', () => {
  const scheduler = new KanbanScheduler();
  const task = scheduler.createTask({
    title: '原始任务',
    description: '原始描述',
    priority: 'low'
  });

  const result = scheduler.updateTask(task.id, {
    title: '更新后任务',
    description: '更新后描述',
    priority: 'high',
    estimatedHours: 5
  });

  if (!result) throw new Error('任务更新失败');

  const board = scheduler.getBoardState();
  const updatedTask = board.flatMap(col => col.tasks).find(t => t.id === task.id);

  if (!updatedTask) throw new Error('找不到更新后的任务');
  if (updatedTask.title !== '更新后任务') throw new Error('任务标题未更新');
  if (updatedTask.priority !== 'high') throw new Error('任务优先级未更新');
});

// 显示最终结果
console.log('\n📊 测试结果汇总:');
console.log(`   任务创建: ${test1 ? '✅' : '❌'}`);
console.log(`   任务移动: ${test2 ? '✅' : '❌'}`);
console.log(`   WIP限制: ${test3 ? '✅' : '❌'}`);
console.log(`   自动调度: ${test4 ? '✅' : '❌'}`);
console.log(`   统计功能: ${test5 ? '✅' : '❌'}`);
console.log(`   任务更新: ${test6 ? '✅' : '❌'}`);

const totalTests = 6;
const passedTests = [test1, test2, test3, test4, test5, test6].filter(Boolean).length;

console.log(`\n🎯 测试通过率: ${passedTests}/${totalTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);

if (passedTests === totalTests) {
  console.log('\n🎉 Kanban调度测试v2 全部通过！');
  console.log('✅ orchestrator调度能力验证成功');
} else {
  console.log('\n⚠️  Kanban调度测试v2 部分失败');
  console.log('❌ 需要检查调度器实现');
}


console.log('\n🏁 Kanban调度测试v2 执行完成');