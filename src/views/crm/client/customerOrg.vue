<template>
  <div class="app-container" v-loading="loading">
    <el-form :inline="true" :model="queryParams" class="search-container">
      <el-form-item label="客户名称/代码">
        <dc-select-remote
          v-model="queryParams.customerId"
          objectName="customer"
          :multiple="false"
          :multipleLimit="1"
          :clearable="true"
          @change="handleQuery"
        />
      </el-form-item>
    </el-form>
    <div id="container" ref="grahpRef"></div>
  </div>
</template>

<script setup name="CustomerOrg">
// 引入 AntV G6
import Api from '@/api/index';
import { getCurrentInstance, nextTick } from 'vue';

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  queryParams: {
    customerId: '',
  },
  graph: null,
  // 关系图数据
  graphData: null,
  grahpRef: null,
});

const { loading, queryParams, graph, graphData, grahpRef } = toRefs(pageData);

onMounted(() => {
  initG6();
});

const loadG6Library = () => {
  return new Promise((resolve, reject) => {
    const scriptId = 'g6-script-tag';

    // 避免重复加载
    if (document.getElementById(scriptId)) {
      resolve(window.G6);
      return;
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '/js/g6.min.js';
      script.async = true;

      script.onload = () => {
        resolve(window.G6);
      };

      script.onerror = () => {
        reject(new Error('加载失败'));
      };
      document.head.appendChild(script);
    }
  });
};

// 初始化G6
const initG6 = () => {
  loadG6Library()
    .then(() => {
      // 注册自定义节点
      G6.registerNode('root', {
        draw: (cfg, group) => {
          const size = [200, 60];
          const keyShape = group.addShape('rect', {
            attrs: {
              width: size[0],
              height: size[1],
              x: -size[0] / 2,
              y: -size[1] / 2,
              fill: 'rgb(19, 33, 92)',
              radius: 5,
            },
            draggable: true,
            name: 'root-keyshape',
          });
          group.addShape('text', {
            attrs: {
              text: `${cfg.name}`,
              fill: 'rgba(255, 255, 255, 0.85)',
              fontSize: 9,
              x: 0,
              y: 0,
              textAlign: 'center',
            },
            draggable: true,
            name: 'label-shape',
          });
          group.addShape('line', {
            attrs: {
              x1: -80,
              x2: 80,
              y1: 2,
              y2: 2,
              stroke: 'rgba(255, 255, 255, 0.85)',
              lineWidth: 0.5,
              textAlign: 'center',
            },
            draggable: true,
            name: 'divider-shape',
          });
          group.addShape('text', {
            attrs: {
              text: `${cfg.email || '-'}`,
              fill: 'rgba(255, 255, 255, 0.65)',
              fontSize: 6,
              x: -6,
              y: 10,
              textAlign: 'center',
            },
            draggable: true,
            name: 'sublabel-shape',
          });
          group.addShape('rect', {
            attrs: {
              x: -40,
              y: 12,
              width: 80,
              height: 8,
              radius: 4,
              fill: cfg.increase ? 'rgb(127, 193, 193)' : 'rgb(220, 124, 125)',
            },
            draggable: true,
            name: 'ratio-box',
          });
          group.addShape('text', {
            attrs: {
              text: `法人：${cfg.post}`,
              fill: 'rgba(255, 255, 255, 0.85)',
              fontSize: 6,
              x: 0,
              y: 14,
              textAlign: 'center',
              textBaseline: 'top',
            },
            draggable: true,
            name: 'ratio-shape',
          });
          return keyShape;
        },
      });

      G6.registerNode(
        'children',
        {
          draw: (cfg, group) => {
            const size = [120, 60];
            const keyShape = group.addShape('rect', {
              attrs: {
                width: size[0],
                height: size[1],
                x: -size[0] / 2,
                y: -size[1] / 2,
                fill: 'rgb(213, 225, 247)',
                radius: 5,
              },
              draggable: true,
              name: 'children-keyshape',
            });
            group.addShape('text', {
              attrs: {
                text: `${cfg.post}`,
                fill: 'rgba(19, 33, 92, 0.65)',
                fontSize: 6,
                x: 0,
                y: -18,
                textAlign: 'center',
              },
              draggable: true,
              name: 'label-shape',
            });
            group.addShape('text', {
              attrs: {
                text: `${cfg.name}`,
                fill: 'rgba(19, 33, 92, 0.65)',
                fontSize: 8,
                x: 0,
                y: -4,
                fontWeight: 800,
                textAlign: 'center',
              },
              draggable: true,
              name: 'sublabel-shape',
            });
            group.addShape('text', {
              attrs: {
                text: `${cfg.mobile}`,
                fill: 'rgba(19, 33, 92, 0.65)',
                fontSize: 6,
                x: 0,
                y: 8,
                textAlign: 'center',
              },
              draggable: true,
              name: 'phone-shape',
            });
            // 背景
            group.addShape('rect', {
              attrs: {
                x: -50,
                y: 15,
                width: 100,
                height: 8,
                radius: 4,
                fill: cfg.increase ? 'rgb(127, 193, 193)' : 'rgb(220, 124, 125)',
              },
              draggable: true,
              name: 'ratio-box',
            });
            group.addShape('text', {
              attrs: {
                text: `${cfg.post}`,
                fill: 'rgba(255, 255, 255, 0.85)',
                fontSize: 6,
                x: 0,
                y: 16,
                textAlign: 'center',
                textBaseline: 'top',
              },
              draggable: true,
              name: 'ratio-shape',
            });
            // edge end
            group.addShape('line', {
              attrs: {
                x1: -size[0] / 2,
                x2: -size[0] / 2 + 2,
                y1: 0,
                y2: 0,
                lineWidth: 1,
                stroke: 'rgb(19, 33, 92)',
              },
            });
            group.addShape('circle', {
              attrs: {
                r: 2,
                x: -size[0] / 2 + 2,
                y: 0,
                fill: 'rgb(19, 33, 92)',
              },
            });
            return keyShape;
          },
        },
        'rect'
      );

      // 定义连接线
      G6.registerEdge(
        'round-poly',
        {
          getControlPoints: cfg => {
            const { startPoint, endPoint } = cfg;

            // 修改起始点的位置
            const modifiedStartPoint = {
              x: startPoint.x, // 向右偏移 10px
              y: startPoint.y, // 保持 y 坐标不变
            };
            return [
              modifiedStartPoint,
              {
                x: modifiedStartPoint.x,
                y: endPoint.y,
              },
              endPoint,
            ];
          },
        },
        'polyline'
      );
    })
    .catch(() => {
      proxy.$message.error('G6加载失败');
    });
};
// 点击选择项
const handleQuery = () => {
  nextTick(async () => {
    if (!queryParams.value.customerId) {
      return;
    }
    try {
      loading.value = true;
      if (graph.value != null) {
        graph.value.destroy(); // 销毁现有的图表实例
        graph.value = null; // 清空图表实例
      }
      const res = await Api.crm.customerContacts.relation(queryParams.value);
      const { code, data } = res.data;
      if (code === 200) {
        graphData.value = data;
        renderGraph();
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  });
};

// 渲染关系图
const renderGraph = () => {
  const dataTreeOrganize = graphData.value;

  G6.Util.traverseTree(dataTreeOrganize, subtree => {
    if (subtree.level === undefined) subtree.level = 0;
    subtree.children?.forEach(children => (children.level = subtree.level + 1));
    switch (subtree.level) {
      case 0:
        subtree.type = 'root';
        break;
      default:
        subtree.type = 'children';
    }
  });

  const container = grahpRef.value;
  const width = container.scrollWidth;
  const height = container.scrollHeight || 500;

  // 确保每次都重新初始化图表
  graph.value = new G6.TreeGraph({
    container: 'container',
    width,
    height,
    fitView: true,
    layout: {
      type: 'compactBox',
      direction: 'LR',
      getHGap: function getVGap() {
        return 120;
      },
    },
    defaultEdge: {
      type: 'round-poly',
      sourceAnchor: 0,
      targetAnchor: 1,
      style: {
        radius: 8,
        stroke: 'rgb(19, 33, 92)',
      },
    },
    defaultNode: {
      anchorPoints: [
        [0.9, 0.5],
        [0, 0.5],
      ],
    },
    nodeStateStyles: {
      hover: {
        fill: '#fff',
        shadowBlur: 30,
        shadowColor: '#ddd',
      },
    },
    modes: {
      default: ['zoom-canvas', 'drag-canvas', 'collapse-expand'],
    },
  });

  // 加载数据并渲染图表
  graph.value.data(dataTreeOrganize);
  graph.value.render();

  // 监听节点 hover 事件
  graph.value.on('node:mouseenter', e => {
    if (e.target.get('name')?.includes('operator')) {
      graph.value.setItemState(e.item, 'operatorhover', true);
    } else {
      graph.value.setItemState(e.item, 'hover', true);
    }
  });

  graph.value.on('node:mouseleave', e => {
    graph.value.setItemState(e.item, 'operatorhover', false);
    graph.value.setItemState(e.item, 'hover', false);
  });
};
</script>

<style scoped lang="scss">
#container {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
