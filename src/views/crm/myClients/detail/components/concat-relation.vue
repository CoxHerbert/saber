<template>
  <!-- 联系人关系 -->
  <div class="comp-concat-ralation">
    <div ref="domRef" class="group-box">
      <div v-if="!relationData" class="no-data">暂无数据</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import Api from '@/api';
import { useRoute } from 'vue-router';

const domRef = ref(null);
const route = useRoute();

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

const relationData = ref(null);

const initG6 = () => {
  loadG6Library().then(() => {
    Api.crm.customerContacts
      .newRelation({
        customerId: route.params.id,
      })
      .then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          if (data.roles?.length > 0) {
            relationData.value = {
              nodes: data.roles.map(r => {
                return {
                  ...r,
                  label: r.name,
                };
              }),
              edges: data.relation?.map(r => {
                return {
                  source: r.relationId1,
                  target: r.relationId2,
                  label: r.relationType,
                  value: Math.random(),
                };
              }),
            };
            renderGraph();
          }
        }
      });
  });
};

const renderGraph = () => {
  //   const { Graph } = G6;

  console.log('relationData.value,', relationData.value);
  const data = relationData.value;
  // 注册自定义节点
  G6.registerNode('company', {
    draw(cfg, group) {
      const padding = 20;
      const textWidth = this.getTextWidth(cfg.name, 12) + padding * 2;
      const height = 40;

      const rect = group.addShape('rect', {
        attrs: {
          x: -textWidth / 2,
          y: -height / 2,
          width: textWidth,
          height: height,
          fill: '#1890FF',
          stroke: '#096DD9',
          radius: 4,
          cursor: 'pointer',
        },
        name: 'rect-shape',
      });

      group.addShape('text', {
        attrs: {
          text: cfg.name,
          fill: '#fff',
          fontSize: 12,
          textAlign: 'center',
          textBaseline: 'middle',
          cursor: 'pointer',
          x: 0,
          y: 0,
        },
        name: 'text-shape',
      });

      return rect;
    },
    getTextWidth(text, fontSize) {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '-1000px';
      div.style.top = '-1000px';
      div.style.fontSize = fontSize + 'px';
      div.style.fontFamily = 'Arial';
      div.textContent = text;
      document.body.appendChild(div);
      const width = div.clientWidth;
      document.body.removeChild(div);
      return width;
    },
  });

  G6.registerNode('contact', {
    draw(cfg, group) {
      const padding = 20;
      const textWidth = this.getTextWidth(cfg.name, 12) + padding * 2;
      const height = 40;

      const rect = group.addShape('rect', {
        attrs: {
          x: -textWidth / 2,
          y: -height / 2,
          width: textWidth,
          height: 40,
          fill: '#13C2C2',
          stroke: '#08979C',
          radius: 4,
          cursor: 'pointer',
        },
        name: 'rect-shape',
      });

      group.addShape('text', {
        attrs: {
          text: cfg.name,
          fill: '#fff',
          fontSize: 12,
          textAlign: 'center',
          textBaseline: 'middle',
          cursor: 'pointer',
          x: 0,
          y: 0,
        },
        name: 'text-shape',
      });

      return rect;
    },
    getTextWidth(text, fontSize) {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '-1000px';
      div.style.top = '-1000px';
      div.style.fontSize = fontSize + 'px';
      div.style.fontFamily = 'Arial';
      div.textContent = text;
      document.body.appendChild(div);
      const width = div.clientWidth;
      document.body.removeChild(div);
      return width;
    },
  });

  // 注册自定义边
  G6.registerEdge('line-arrow', {
    draw(cfg, group) {
      const startPoint = cfg.startPoint;
      const endPoint = cfg.endPoint;

      const line = group.addShape('path', {
        attrs: {
          path: [
            ['M', startPoint.x, startPoint.y],
            ['L', endPoint.x, endPoint.y],
          ],
          stroke: '#A3B1BF',
          lineWidth: 2,
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#A3B1BF',
          },
        },
        name: 'path-shape',
      });

      if (cfg.label) {
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const textWidth = cfg.label?.length * 12 + 20;

        group.addShape('rect', {
          attrs: {
            x: midX - textWidth / 2,
            y: midY - 8,
            width: textWidth,
            height: 16,
            fill: 'rgb(140, 148, 225)',
            stroke: 'rgb(140, 198, 225)',
            radius: 4,
            cursor: 'pointer',
          },
          name: 'rect-arrow-shape',
        });

        group.addShape('text', {
          attrs: {
            x: midX,
            y: midY,
            text: cfg.label,
            fill: '#333',
            fontSize: 10,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          name: 'text-shape',
        });
      }

      return line;
    },
  });

  const container = domRef.value;
  const width = container.scrollWidth;
  const height = container.scrollHeight || 800;

  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 20,
    width: 200,
    getContent(e) {
      const modelData = e.item.getModel();
      let str = '';
      if (modelData.type === 'contact') {
        const labels = ['姓名', '手机号', '职位', '邮箱'];
        ['name', 'mobile', 'post', 'email'].forEach((k, i) => {
          if (modelData[k]) {
            str += `<li style="white-space: wrap; word-break: break-all;">${labels[i]}:&nbsp;${modelData[k]}</li>`;
          }
        });
      } else {
        const labels = ['名称', '负责人'];
        ['name', 'post'].forEach((k, i) => {
          if (modelData[k]) {
            str += `<li style="white-space: wrap; word-break: break-all;">${labels[i]}:&nbsp;${modelData[k]}</li>`;
          }
        });
      }
      const outDiv = document.createElement('div');
      outDiv.style.width = '180px';
      outDiv.innerHTML = `
      <h4>节点信息</h4>
      <ul>
      ${str}
      </ul>`;
      return outDiv;
    },
    itemTypes: ['node'],
  });

  const graph = new G6.Graph({
    container: domRef.value,
    width,
    height,
    plugins: [tooltip],
    modes: {
      default: ['drag-canvas', 'zoom-canvas'],
    },
    layout: {
      type: 'force2',
    },
    defaultNode: {
      type: 'circle',
      size: 30,
      style: {
        fill: '#DEE9FF',
        stroke: '#5B8FF9',
      },
      labelCfg: {
        style: {
          fontSize: 12,
        },
      },
    },
    defaultEdge: {
      type: 'line-arrow',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 2,
      },
      labelCfg: {
        autoRotate: true,
        style: {
          fontSize: 12,
        },
      },
    },
    nodeStateStyles: {
      hover: {
        fill: '#1890FF',
      },
      selected: {
        stroke: '#FF6A00',
        lineWidth: 2,
      },
    },
    edgeStateStyles: {
      hover: {
        stroke: '#1890FF',
      },
      selected: {
        stroke: '#FF6A00',
        lineWidth: 2,
      },
    },
  });

  // 处理数据
  const nodes = data.nodes.map(node => {
    return {
      id: node.id,
      type: node.type,
      label: node.label,
      name: node.name,
      post: node.post,
      mobile: node.mobile,
      email: node.email,
      x: node.x,
      y: node.y,
      style: node.style,
    };
  });

  const edges = data.edges.map(edge => {
    return {
      source: edge.source,
      target: edge.target,
      label: edge.label,
      value: edge.value,
      id: edge.id,
      style: edge.style,
      startPoint: edge.startPoint,
      endPoint: edge.endPoint,
    };
  });

  graph.data({
    nodes,
    edges,
  });

  graph.render();

  graph.on('node:dragstart', function (e) {
    graph.layout();
    refreshDragedNodePosition(e);
  });
  graph.on('node:drag', function (e) {
    const forceLayout = graph.get('layoutController').layoutMethods[0];
    forceLayout.execute();
    refreshDragedNodePosition(e);
  });
  graph.on('node:dragend', function (e) {
    e.item.get('model').fx = null;
    e.item.get('model').fy = null;
  });

  if (typeof window !== 'undefined')
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return;
      if (!container || !container.scrollWidth || !container.scrollHeight) return;
      graph.changeSize(container.scrollWidth, container.scrollHeight);
    };

  function refreshDragedNodePosition(e) {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  }

  graph.on('afterlayout', () => {
    graph.fitView();
  });
};
</script>
<style lang="scss">
.comp-concat-ralation {
  width: 100%;
  height: auto;
  display: flex;
  flex: 1;

  .group-box {
    flex: 1;
    width: 100%;
    height: 100%;
  }
  .no-data {
    color: #666;
    text-align: center;
    margin-top: 100px;
  }
}
</style>
