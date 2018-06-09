/* eslint-disable no-param-reassign,no-unused-vars,object-shorthand,arrow-body-style */

import * as d3 from 'd3';
import * as $ from 'jquery';
import uuid from 'uuid/v1';
import csvjson from 'csvjson';
import * as VueColor from 'vue-color';
import _ from 'lodash';
import pcorr from 'compute-pcorr';
// import workerFarm from 'worker-farm';
import clusterMaker from 'clusters';

require('d3-selection-multi');

const colorCorrelation = d3.scaleLinear().domain([-1, 0, 1])
  .range([d3.rgb('#E53935'), d3.rgb('#fff'), d3.rgb('#1E88E5')]);

const colorDimensionCluster = d3.scaleLinear().domain([0, 1])
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb('#007AFF'), d3.rgb('#ffe011')]);

const line = d3.line()
  .x(d => d.x)
  .y(d => d.y).curve(d3.curveCardinal);

function sigma(array) {
  const arr = _.map(array, i => i * 1);
  const avg = _.sum(arr) / arr.length;
  return Math.sqrt(_.sum(_.map(arr, i => ((i - avg) * (i - avg)) / arr.length)));
}

function getRadialCoord(degree, radius) {
  const radian = (degree / 180) * Math.PI;
  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
  };
}

function getAngldByCoord(coord) {
  return (Math.atan2(coord.y - 0, coord.x - 0) * 180) / Math.PI;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

const lineFunc = d3.line().x(d => d.x).y(d => d.y);
const lineFunction = d3.line()
  .x(d => d.x).y(d => d.y).curve(d3.curveBasisClosed);
const width = 1080;
const height = 1080;
const radius = 400;
const parallelHeight = 220;


export default {
  name: 'radvis',
  components: {
    picker: VueColor.Compact,
  },
  data() {
    return {
      viewOption: {
        useCorrelationMatrix: false,
        useDimensionCluster: false,
      },
      fillRadvis: false,
      nodeRadius: 5,
      nodeOpacity: 50,
      clusters: [],
      makeClusterCount: 2,
      isUseA: false,
      dimensionFontSize: 12,
      positions: {
        radvisCenterX: 590,
        radvisCenterY: 540,
      },
      color: {
        start: {
          hex: '#007AFF',
        },
        end: {
          hex: '#FFF500',
        },
      },
      colorDimension: '',
      raw: [],
      dimensions: [
        {
          text: 'A',
          x: 0,
          y: 15,
        },
      ],
      tableOption: {
        pagination: {
          enabled: true,
          perPage: 5,
          perPageDropdown: [5],
          dropdownAllowAll: false,
        },
      },
      selectedNodes: [],
      nodes: [],
      paths: [],
      rc: {
        x: 0,
      },
      x: 10,
      selectDimension: {},
      filter: {
        usage: false,
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 5,
      },
      columns: [
        {
          label: 'Name',
          field: 'name',
          filterOptions: {
            enabled: true,
          },
        },
        {
          label: 'Age',
          field: 'age',
          type: 'number',
        },
        {
          label: 'Created On',
          field: 'createdAt',
          type: 'date',
          dateInputFormat: 'YYYY-MM-DD',
          dateOutputFormat: 'MMM Do YY',
        },
        {
          label: 'Percent',
          field: 'score',
          type: 'percentage',
        },
      ],
      rows: [
        { name: 'John', age: 20, createdAt: '201-10-31:9: 35 am', score: 0.03343 },
        { name: 'Jane', age: 24, createdAt: '2011-10-31', score: 0.03343 },
        { name: 'Susan', age: 16, createdAt: '2011-10-30', score: 0.03343 },
        { name: 'Chris', age: 55, createdAt: '2011-10-11', score: 0.03343 },
        { name: 'Dan', age: 40, createdAt: '2011-10-21', score: 0.03343 },
        { name: 'John', age: 20, createdAt: '2011-10-31', score: 0.03343 },
        { name: 'Jane', age: 24, createdAt: '20111031' },
        { name: 'Susan', age: 16, createdAt: '2013-10-31', score: 0.03343 },
      ],
    };
  },
  computed: {
    getFilterRect() {
      return {
        x: (this.filter.startX > this.filter.endX ? this.filter.endX : this.filter.startX) - this.positions.radvisCenterX,
        y: (this.filter.startY > this.filter.endY ? this.filter.endY : this.filter.startY) - this.positions.radvisCenterY,
        width: Math.abs(this.filter.startX - this.filter.endX),
        height: Math.abs(this.filter.startY - this.filter.endY),
      };
    },
    getRadvisCenterTransform() {
      return `translate(${this.positions.radvisCenterX},${this.positions.radvisCenterY})`;
    },
    isSelectedDimension() {
      return !_.isEmpty(this.selectDimension);
    },
    getNodeDistributionGraph() {
      if (_.isEmpty(this.selectDimension)) return 0;
      this.renderNodeDistribution();
      return this.selectDimension.distribution.length;
    },
    getLineData() {
      const json = this.raw;
      const color = d3.scaleLinear().domain([0, json.length])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb(this.color.start), d3.rgb(this.color.end)]);
      const dimensions = this.dimensions;
      const usageDimensions = _.filter(dimensions, d => d.usage);
      const rets = _.chain(json).map((each, idx) => {
        const coord = _.map(usageDimensions, (dimension, i) => {
          const ratio = dimension.getRatio(each[dimension.text]);
          return {
            x: (1100 / (usageDimensions.length - 1)) * i,
            y: ratio * parallelHeight,
          };
        });
        return {
          coord,
          color: color(idx),
        };
      }).value();
      return rets;
    },
    getSelectedData() {
      return _.map(this.selectedNodes, node => this.raw[node.index]);
    },
  },
  methods: {
    convertUsageViewOption(viewOptionName) {
      this.viewOption[viewOptionName] = !this.viewOption[viewOptionName];
    },
    colorDimensionCluster(index, length) {
      return colorDimensionCluster(index / length);
    },
    getCorrelationColor(corr) {
      return colorCorrelation(corr);
    },
    changeDimensionUsage(dimension) {
      dimension.usage = !dimension.usage;
      this.updateNodes();
    },
    getDimensionGroupAngle(angle) {
      return `rotate(${angle + 90})`;
    },
    getDimensionTextTransform(angle) {
      return `translate(0,-30) rotate(${(angle < 0 || angle > 180) ? 0 : 180})`;
    },
    getDimensionTextTransformReverse(angle) {
      return `translate(0,-30) rotate(${(angle < 0 || angle > 180) ? 180 : 0})`;
    },
    getDimensionTextVisible(angle) {
      return (angle < 0 || angle > 180) ? 0 : 1;
    },
    onFillRadvis() {
      this.updateNodes();
    },
    lining(coord) {
      return lineFunc(coord);
    },
    doClusterDimension() {
      const dimensions = _.filter(this.dimensions, dimension => dimension.usage);
      const notUsageDimensions = _.filter(this.dimensions, dimension => !dimension.usage);
      const kmeansCount = _.isNil(this.makeClusterCount) ? Math.floor(Math.sqrt(dimensions.length)) : this.makeClusterCount;
      clusterMaker.k(kmeansCount);
      clusterMaker.iterations(100);
      const vals = _.map(dimensions, dimension => _.map(dimension.correlation, v => v));
      const origins = _.map(dimensions, (dimension) => {
        return {
          name: dimension.name,
          vals: _.map(dimension.correlation, v => v),
        };
      });
      clusterMaker.data(vals);
      this.clusters = _.map(clusterMaker.clusters(), (cluster) => {
        const clusterDimensions = _.map(cluster.points, (point) => {
          const found = _.find(origins, origin => _.isEqual(origin.vals, point));
          return found.name;
        });
        return {
          centroid: cluster.centroid,
          dimensions: clusterDimensions,
        };
      });
      const arrangedDimensions = [];
      const diffClusterAngle = 180 / this.clusters.length;
      const diffDimensions = 180 / this.dimensions.length;
      let currentAngle = 0;
      _.map(this.clusters, (cluster) => {
        _.forEach(cluster.dimensions, (dimension) => {
          currentAngle += diffDimensions * 0.5;
          const foundDimension = _.find(dimensions, d => d.name === dimension);
          arrangedDimensions.push(foundDimension);
          const coord = getRadialCoord(currentAngle, radius);
          foundDimension.x = coord.x;
          foundDimension.y = coord.y;
          foundDimension.angle = currentAngle;
          currentAngle += diffDimensions * 0.5;
        });
        currentAngle += diffClusterAngle;
      });
      _.forEach(notUsageDimensions, dimension => arrangedDimensions.push(dimension));
      this.updateNodes();
      this.dimensions = arrangedDimensions;
    },
    setColorDimensionCurrentDimension() {
      this.colorDimension = this.selectDimension;
      this.updateNodes();
    },
    setSelectDimension(dimensionName) {
      if (_.isNil(dimensionName)) return;
      this.selectDimension = this.getDimensionByName(dimensionName);
      this.setColorDimensionCurrentDimension();
      this.renderNodeDistribution();
    },
    makeNodeData(clear) {
      if (_.isNil(clear)) clear = false;
      const json = this.raw;
      if (_.isEmpty(this.colorDimension)) this.colorDimension = this.dimensions[0];
      const color = d3.scaleLinear().domain([this.colorDimension.min, this.colorDimension.max])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb(this.color.start.hex), d3.rgb(this.color.end.hex)]);
      const dimensions = this.dimensions;
      const usageDimensions = _.filter(dimensions, d => d.usage);
      const nodes = _.chain(json).map((each, i) => {
        const totalWeight = usageDimensions.length;
        const coord = _.map(usageDimensions, (dimension) => {
          const ratio = dimension.getRatioByApplier(each[dimension.text]);
          return {
            x: dimension.x * ratio,
            y: dimension.y * ratio,
          };
        });
        const defaultCoord = _.map(usageDimensions, (dimension) => {
          const ratio = dimension.getRatio(each[dimension.text]);
          return {
            x: dimension.x * (ratio * 0.9),
            y: dimension.y * (ratio * 0.9),
          };
        });
        const cx = _.sumBy(coord, c => c.x) / totalWeight;
        const cy = _.sumBy(coord, c => c.y) / totalWeight;
        const dist = Math.sqrt((cx * cx) + (cy * cy));
        let selected;
        if (clear) selected = true;
        else selected = _.isNil(this.nodes[i]) ? false : this.nodes[i].selected;
        return {
          index: i,
          coord: defaultCoord,
          cx,
          cy,
          dist,
          selected,
          opacity: this.nodeOpacity * 0.01,
          fill: color(each[this.colorDimension.text]),
          dataIndex: i,
        };
      }).filter(node => !_.isNaN(node.cx) || !_.isNaN(node.cy)).value();
      if (_.isEmpty(nodes)) return [];
      if (this.fillRadvis) {
        const maxDist = _.maxBy(nodes, node => node.dist).dist;
        const mul = 350 / maxDist;
        _.forEach(nodes, (node) => {
          node.cx *= mul;
          node.cy *= mul;
        });
      }
      return nodes;
    },
    updateNodes(clear) {
      this.nodes = this.makeNodeData(clear);
      this.updateSelectNodeView();
    },
    getDimensionData(uid) {
      return _.find(this.dimensions, d => d.uid === uid);
    },
    getActiveDimensionSize() {
      return _.filter(this.dimensions, d => d.usage).length;
    },
    getDimensionByName(name) {
      return _.find(this.dimensions, d => d.name === name);
    },
    initDimensions() {
      const json = this.raw;
      const keys = _.keys(json[0]);
      this.columns = [];
      const dimensions = _.chain(keys).map((k, i) => {
        const ret = {
          type: Number,
          usage: true,
        };
        _.forEach(json, (d) => {
          if (_.isNaN(d[k] * 1)) {
            ret.type = String;
            ret.usage = false;
          }
        });
        this.columns.push({
          label: k,
          field: k,
          type: ret.type === Number ? 'number' : 'string',
        });

        if (ret.type === Number) {
          const values = _.map(json, d => d[k] * 1);
          ret.min = _.minBy(values);
          ret.values = values;
          ret.max = _.maxBy(values);
          ret.sigma = sigma(values);
          ret.mean = _.sum(values) / values.length;
          ret.text = k;
          ret.name = k;
          ret.x = 0;
          ret.y = 0;
          ret.calcurate = 'Normal';
          ret.getRatio = val => (val - ret.min) / (ret.max - ret.min);
          ret.getRatio2 = val => val / ret.max;
          ret.getNormalizeValue = val => ret.getRatio2(val);
          ret.uid = uuid();
          ret.selected = false;

          const distribution = [];
          const powerApplier = [];
          let count = _.chain(values).countBy(value => value).size().value();

          if (count >= 10) count = 10;
          const diff = (ret.max - ret.min) / count;
          const halfDiff = diff / 2;
          for (let idx = 0; idx <= count; idx += 1) {
            const key = (ret.min + (diff * idx) + halfDiff).toFixed(2);
            distribution[idx] = {
              key,
              count: 0,
            };
            powerApplier[idx] = {
              min: ret.min + (diff * idx),
              max: ret.min + (diff * (idx + 1)),
              mean: key * 1,
              power: idx * (10 / count),
              index: idx,
            };
          }
          _.forEach(values, (v) => {
            const calcIdx = Math.floor((v - ret.min) / diff);
            distribution[calcIdx].count += 1;
          });
          ret.distribution = distribution;
          ret.powerApplier = powerApplier;
          ret.getRatioByApplier = (val) => {
            const pa = _.find(powerApplier, p => val >= p.min && val <= p.max);
            if (pa.index === 0 || pa.index === count) return pa.power * 0.1;
            let std;
            let dst;
            const ratio = Math.abs((val - pa.mean) / diff);
            if (val < pa.min) {
              std = pa.power;
              dst = powerApplier[pa.index - 1].power;
            } else {
              std = pa.power;
              dst = powerApplier[pa.index + 1].power;
            }
            const calcedPower = (std * (1 - ratio)) + (dst * ratio);
            return calcedPower * 0.1;
          };
        } else return null;
        return ret;
      }).filter(d => d !== null).value();

      _.forEach(dimensions, (dimension) => {
        const correlation = {};
        _.forEach(dimensions, (target) => {
          const corr = pcorr(dimension.values, target.values);
          correlation[target.name] = corr[0][1];
        });
        dimension.correlation = correlation;
      });
      _.forEach(dimensions, (dimension, i) => {
        const angle = (i / dimensions.length) * 360;
        const coord = getRadialCoord(angle, radius);
        dimension.x = coord.x;
        dimension.y = coord.y;
        dimension.angle = angle;
      });

      this.dimensions = dimensions;
      this.makeClusterCount = Math.floor(Math.sqrt(dimensions.length));
      this.selectDimension = dimensions[0];
    },
    onSelectFileButton() {
      const $fileInput = $('#fileInput');
      $fileInput.trigger('click');
      $fileInput.on('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const json = csvjson.toObject(reader.result);
          this.raw = json;
          console.log(this.raw);
          this.initDimensions();
          this.updateNodes(true);
          this.render();
        });
        reader.readAsText(file);
      });
    },
    updateSelectNodeView() {
      _.forEach(this.nodes, (node) => {
        node.opacity = this.nodeOpacity * 0.001;
      });
      const selectedNodes = _.filter(this.nodes, node => node.selected);
      this.paths = _.map(selectedNodes, (node) => {
        node.opacity = this.nodeOpacity * 0.01;
        node.coord = _.sortBy(node.coord, c => ((Math.atan2(c.y, c.x) * 180) / Math.PI) + 180);
        const c = d3.color(node.fill);
        return {
          d: lineFunction(node.coord),
          fill: `rgba(${c.r},${c.g},${c.b},0.05)`,
          stroke: node.fill,
        };
      });
      this.selectedNodes = selectedNodes;
    },
    makeSelectNodeView() {
      const rect = {
        x: (this.filter.startX > this.filter.endX ? this.filter.endX : this.filter.startX) - this.positions.radvisCenterX,
        y: (this.filter.startY > this.filter.endY ? this.filter.endY : this.filter.startY) - this.positions.radvisCenterY,
        width: Math.abs(this.filter.startX - this.filter.endX),
        height: Math.abs(this.filter.startY - this.filter.endY),
      };
      if (rect.width < 1 && rect.height < 1) {
        this.releaseSelectNodeView();
        return;
      }
      _.forEach(this.nodes, (node) => {
        node.opacity = this.nodeOpacity * 0.001;
      });
      const selectedNodes = _.filter(this.nodes, (node) => {
        const selected = (node.cx > rect.x) && (node.cx < (rect.x + rect.width))
          && (node.cy > rect.y) && (node.cy < (rect.y + rect.height));
        node.selected = selected;
        return selected;
      });
      this.paths = _.map(selectedNodes, (node) => {
        node.opacity = this.nodeOpacity * 0.01;
        node.coord = _.sortBy(node.coord, c => ((Math.atan2(c.y, c.x) * 180) / Math.PI) + 180);
        const c = d3.color(node.fill);
        return {
          d: lineFunction(node.coord),
          fill: `rgba(${c.r},${c.g},${c.b},0.05)`,
          stroke: node.fill,
        };
      });
      this.selectedNodes = selectedNodes;
    },
    releaseSelectNodeView() {
      console.log('release selected node');
      _.forEach(this.nodes, (node) => {
        node.opacity = this.nodeOpacity * 0.01;
        node.selected = true;
      });
      this.paths = [];
      this.updateNodes();
    },
    async render() {
      await wait(1000);
      let draggingTarget = null;
      const that = this;
      const rootFilter = d3.selectAll('g#filter');
      console.log('rendered');

      let startX;
      let startY;
      const dragFilter = d3.drag()
        .on('start', () => {
          startX = d3.event.x;
          startY = d3.event.y;
          this.filter.usage = true;
          this.filter.startX = d3.event.x;
          this.filter.startY = d3.event.y;
          this.filter.endX = d3.event.x;
          this.filter.endY = d3.event.y;
        }).on('drag', () => {
          this.filter.endX = d3.event.x;
          this.filter.endY = d3.event.y;
        }).on('end', () => {
          this.filter.usage = false;
          this.filter.endX = d3.event.x;
          this.filter.endY = d3.event.y;
          this.makeSelectNodeView();
        });
      rootFilter.call(dragFilter);

      const dimensions = d3.selectAll('g.dimension.controll');
      const drag = d3.drag()
        .on('start', function () {
          draggingTarget = that.getDimensionData(d3.select(this).attr('uid'));
          that.selectDimension = draggingTarget;
          draggingTarget.selected = true;
        }).on('drag', () => {
          const angle = getAngldByCoord({
            x: d3.event.x,
            y: d3.event.y,
          });
          const coord = getRadialCoord(angle, radius);
          draggingTarget.angle = angle;
          draggingTarget.x = coord.x;
          draggingTarget.y = coord.y;
        }).on('end', () => {
          draggingTarget.selected = false;
          draggingTarget = null;
          that.updateNodes();
        });
      dimensions.call(drag);
    },
    renderNodeDistribution() {
      const that = this;
      const root = d3.select('svg.distribution');
      root.selectAll('*').remove();
      const distribution = this.selectDimension.distribution;
      const powerApplier = this.selectDimension.powerApplier;
      const distributionCount = this.selectDimension.distribution.length;
      // const maxCount = this.nodes.length;
      const maxCount = _.maxBy(distribution, d => d.count).count;
      const ratio = 150 / maxCount;
      const barWidth = 300 / distributionCount;
      const color = d3.scaleLinear().domain([0, distributionCount])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb(this.color.start.hex), d3.rgb(this.color.end.hex)]);

      _.forEach(distribution, (d, i) => {
        root.append('rect').attrs({
          class: 'distribution',
          x: 20 + (i * barWidth),
          y: 180,
          width: barWidth - 1,
          height: 0,
          fill: color(i),
        }).transition((d.count / maxCount) * 2000).delay(i * 50)
          .attrs({
            y: 180 - (d.count * ratio),
            height: d.count * ratio,
          });
        root.append('text').attrs({
          class: 'central',
          x: 20 + (i * barWidth) + (barWidth / 2),
          y: 170,
          'font-size': '11px',
          'font-weight': 600,
          fill: color(i),
          opacity: 0,
        }).text(d.count).transition((d.count / maxCount) * 1000)
          .delay(i * 50)
          .attrs({
            y: 170 - (d.count * ratio),
            opacity: 1,
          });

        root.append('text').attrs({
          class: 'central dimensionKey',
          x: 20 + (i * barWidth) + (barWidth / 2),
          y: 190,
          'font-size': '11px',
          'font-weight': 600,
          fill: '#555',
          opacity: 0,
        }).text(d.key < 10 ? (d.key * 1).toFixed(1) : Math.floor(d.key))
          .transition((d.count / maxCount) * 1000)
          .delay(i * 50)
          .attrs({
            opacity: 1,
          });
      });

      const defaultPathPoints = _.map(powerApplier, (p, i) => {
        return {
          x: (i * barWidth) + 20 + (barWidth * 0.5),
          y: 180 - (i * 10),
          power: p.power,
        };
      });
      const pathPoints = _.map(powerApplier, (p, i) => {
        return {
          x: (i * barWidth) + 20 + (barWidth * 0.5),
          y: 180 - (p.power * 10),
          power: p.power,
        };
      });


      const gApplier = root.append('g');

      function createPowerApplierPath() {
        gApplier.selectAll('*').remove();
        gApplier.append('path').attrs({
          class: 'power-applier',
          d: line(pathPoints),
        });
        _.forEach(pathPoints, (p) => {
          gApplier.append('text').attrs({
            class: 'central power-applier-text',
            x: p.x,
            y: p.y - 12,
          }).text((p.power * 1).toFixed(2));
        });
      }


      createPowerApplierPath();

      let draggingTarget = null;
      const drag = d3.drag()
        .on('start', function () {
          draggingTarget = d3.select(this);
        }).on('drag', () => {
          let y = d3.event.y;
          if (y < 30) y = 30;
          if (y > 180) y = 180;
          draggingTarget.attr('cy', y);
        }).on('end', () => {
          let y = d3.event.y;
          if (y < 30) y = 30;
          if (y > 180) y = 180;
          draggingTarget.attr('cy', y);
          const revertPower = -(y - 180) / 10;
          powerApplier[draggingTarget.attr('idx') * 1].power = revertPower;
          draggingTarget = null;
          createPowerApplierPath();
          this.updateNodes();
        });

      _.forEach(pathPoints, (p, i) => {
        const controller = root.append('circle').attrs({
          class: 'power-applier',
          idx: i,
          cx: p.x,
          cy: p.y,
        });
        controller.call(drag);
      });
    },
  },
};
