import { KanbanScheduler, KanbanTask } from '../services/kanbanScheduler';

/**
 * Kanban调度测试v2
 *
 * 这个测试文件验证Kanban调度器的核心功能，用于测试orchestrator的调度能力
 */

// 简单测试框架实现 - 支持嵌套describe和beforeEach
const testSuites: Array<{ name: string; setup: (() => void) | null; tests: Array<{ name: string; fn: (scheduler: KanbanScheduler) => void }> }> = [];
let currentSuite: { name: string; setup: (() => void) | null; tests: Array<{ name: string; fn: (scheduler: KanbanScheduler) => void }> } | null = null;

function describe(name: string, fn: () => void) {
  const parentSuite = currentSuite;

  // 创建新suite
  const newSuite: { name: string; setup: (() => void) | null; tests: Array<{ name: string; fn: (scheduler: KanbanScheduler) => void }> } = {
    name,
    setup: parentSuite ? parentSuite.setup : null,
    tests: []
  };

  currentSuite = newSuite;

  if (parentSuite === null) {
    testSuites.push(newSuite);
  }

  fn();

  if (parentSuite !== null) {
    // 如果是嵌套的，添加到父级的tests
    parentSuite.tests = parentSuite.tests.concat(newSuite.tests);
  }

  currentSuite = parentSuite;
}

function beforeEach(fn: () => void) {
  if (currentSuite) {
    currentSuite.setup = fn;
  }
}

function it(description: string, fn: (scheduler: KanbanScheduler) => void) {
  if (currentSuite) {
    currentSuite.tests.push({ name: description, fn: fn });
  }
}

// 简单的expect函数实现
function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${expected} but got ${value}`);
      }
    },
    toBeDefined() {
      if (value === undefined || value === null) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeInstanceOf(constructor: any) {
      if (!(value instanceof constructor)) {
        throw new Error(`Expected value to be instance of ${constructor.name}`);
      }
    },
    toContain(expected: any) {
      if (!value.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (value > expected) {
        throw new Error(`Expected ${value} to be less than or equal to ${expected}`);
      }
    }
  };
}

// 定义测试套件
describe('KanbanScheduler', () => {
  beforeEach(() => {
    // beforeEach body is handled during test execution
  });

  describe('任务管理', () => {
    it('应该能够创建新任务', (scheduler: KanbanScheduler) => {
      const task = scheduler.createTask({
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 'medium',
        estimatedHours: 2
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('测试任务');
      expect(task.status).toBe('todo');
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('新任务应该自动放入待办列', (scheduler: KanbanScheduler) => {
      scheduler.createTask({
        title: '测试任务',
        description: '这是一个测试任务',
        priority: 'medium'
      });

      const todoColumn = scheduler.getBoardState().find(col => col.status === 'todo');
      expect(todoColumn?.tasks.length).toBe(1);
      expect(todoColumn?.tasks[0].title).toBe('测试任务');
    });
  });

  describe('任务移动', () => {
    it('应该能够移动任务到进行中', (scheduler: KanbanScheduler) => {
      const task = scheduler.createTask({
        title: '移动测试任务',
        description: '测试移动功能',
        priority: 'high'
      });

      const result = scheduler.moveTask(task.id, 'in-progress');
      expect(result).toBe(true);

      const inProgressColumn = scheduler.getBoardState().find(col => col.status === 'in-progress');
      expect(inProgressColumn?.tasks.length).toBe(1);
      expect(inProgressColumn?.tasks[0].title).toBe('移动测试任务');
    });

    it('应该遵守WIP限制', (scheduler: KanbanScheduler) => {
      // 创建3个任务并移动到进行中（WIP限制为3）
      for (let i = 1; i <= 3; i++) {
        const task = scheduler.createTask({
          title: `任务${i}`,
          description: `任务${i}描述`,
          priority: 'medium'
        });
        scheduler.moveTask(task.id, 'in-progress');
      }

      // 尝试移动第4个任务应该失败
      const task4 = scheduler.createTask({
        title: '任务4',
        description: '任务4描述',
        priority: 'medium'
      });

      const result = scheduler.moveTask(task4.id, 'in-progress');
      expect(result).toBe(false);

      const inProgressColumn = scheduler.getBoardState().find(col => col.status === 'in-progress');
      expect(inProgressColumn?.tasks.length).toBe(3);
    });
  });

  describe('调度器运行', () => {
    it('应该自动推进任务状态', (scheduler: KanbanScheduler) => {
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

      // 手动移动一些任务到不同状态
      scheduler.moveTask(task1.id, 'in-progress');
      scheduler.moveTask(task2.id, 'review');

      // 运行调度器
      const actions = scheduler.runScheduler();

      // 验证调度器执行了正确的操作
      expect(actions).toContain(`任务 "任务2" 从审核中移动到已完成`);
      expect(actions).toContain(`任务 "任务1" 从进行中移动到审核中`);

      // 验证任务状态已更新
      const doneColumn = scheduler.getBoardState().find(col => col.status === 'done');
      const reviewColumn = scheduler.getBoardState().find(col => col.status === 'review');

      expect(doneColumn?.tasks.length).toBe(1);
      expect(reviewColumn?.tasks.length).toBe(1);
    });

    it('应该自动从待办中拉取任务', (scheduler: KanbanScheduler) => {
      // 创建多个任务
      for (let i = 1; i <= 5; i++) {
        scheduler.createTask({
          title: `任务${i}`,
          description: `任务${i}描述`,
          priority: 'medium'
        });
      }

      // 运行调度器多次来测试自动拉取
      const actions1 = scheduler.runScheduler();
      const actions2 = scheduler.runScheduler();

      // 验证调度器自动拉取了任务
      expect(actions1.length).toBeGreaterThan(0);
      expect(actions2.length).toBeGreaterThan(0);

      const inProgressColumn = scheduler.getBoardState().find(col => col.status === 'in-progress');
      expect(inProgressColumn?.tasks.length).toBeLessThanOrEqual(3); // WIP限制
    });
  });

  describe('统计功能', () => {
    it('应该正确计算统计信息', (scheduler: KanbanScheduler) => {
      // 创建不同状态的任务
      scheduler.createTask({ title: '任务1', description: '任务1', priority: 'high', estimatedHours: 5 });
      scheduler.createTask({ title: '任务2', description: '任务2', priority: 'medium', estimatedHours: 3 });

      const task3 = scheduler.createTask({ title: '任务3', description: '任务3', priority: 'low', estimatedHours: 2 });
      scheduler.moveTask(task3.id, 'in-progress');

      const task4 = scheduler.createTask({ title: '任务4', description: '任务4', priority: 'medium', estimatedHours: 4 });
      scheduler.moveTask(task4.id, 'done');

      const stats = scheduler.getStatistics();

      expect(stats.totalTasks).toBe(4);
      expect(stats.completedTasks).toBe(1);
      expect(stats.inProgressTasks).toBe(1);
      expect(stats.todoTasks).toBe(2);
      expect(stats.completionRate).toBe(25);
      expect(stats.totalEstimatedHours).toBe(14);
    });
  });

  describe('任务更新', () => {
    it('应该能够更新任务信息', (scheduler: KanbanScheduler) => {
      const task = scheduler.createTask({
        title: '原始标题',
        description: '原始描述',
        priority: 'low',
        estimatedHours: 1
      });

      const result = scheduler.updateTask(task.id, {
        title: '更新标题',
        description: '更新描述',
        priority: 'high',
        estimatedHours: 3
      });

      expect(result).toBe(true);

      const updatedTask = scheduler.getBoardState()
        .flatMap(col => col.tasks)
        .find(t => t.id === task.id);

      expect(updatedTask?.title).toBe('更新标题');
      expect(updatedTask?.description).toBe('更新描述');
      expect(updatedTask?.priority).toBe('high');
      expect(updatedTask?.estimatedHours).toBe(3);
    });
  });
});

// 执行所有测试
function runTests() {
  let totalTests = 0;
  let passedTests = 0;

  testSuites.forEach(suite => {
    console.log(`\n📋 ${suite.name}`);

    suite.tests.forEach(test => {
      totalTests++;

      // 为每个测试创建新的scheduler实例
      const scheduler = new KanbanScheduler();

      // 如果该suite有setup函数，执行它（用于内部状态）
      if (suite.setup) {
        suite.setup();
      }

      try {
        // 执行测试函数，传入scheduler实例
        test.fn(scheduler);
        console.log(`  ✅ ${test.name}`);
        passedTests++;
      } catch (error) {
        console.log(`  ❌ ${test.name}`);
        if (error instanceof Error) {
          console.log(`     Error: ${error.message}`);
        }
      }
    });
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Some tests failed!');
  }
}

// 运行测试
runTests();
