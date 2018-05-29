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
      nodes: [],
      rc: {
        x: 0,
      },
      x: 10,
      selectDimension: {},
    };
  },
  computed: {
    getRadvisCenterTransform() {
      return `translate(${this.positions.radvisCenterX},${this.positions.radvisCenterY})`;
    },
    isSelectedDimension() {
      return !_.isEmpty(this.selectDimension);
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
  },
  methods: {
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
      console.log('select ', dimensionName);
      if (_.isNil(dimensionName)) return;
      this.selectDimension = this.getDimensionByName(dimensionName);
      this.setColorDimensionCurrentDimension();
    },
    makeNodeData() {
      const json = this.raw;
      if (_.isEmpty(this.colorDimension)) this.colorDimension = this.dimensions[0];
      const color = d3.scaleLinear().domain([this.colorDimension.min, this.colorDimension.max])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb(this.color.start.hex), d3.rgb(this.color.end.hex)]);
      const dimensions = this.dimensions;
      const usageDimensions = _.filter(dimensions, d => d.usage);
      const nodes = _.chain(json).map((each, i) => {
        const coord = _.map(usageDimensions, (dimension) => {
          const ratio = dimension.getRatio(each[dimension.text]);
          return {
            x: dimension.x * ratio,
            y: dimension.y * ratio,
          };
        });
        const cx = _.sumBy(coord, c => c.x) / usageDimensions.length;
        const cy = _.sumBy(coord, c => c.y) / usageDimensions.length;
        const dist = Math.sqrt((cx * cx) + (cy * cy));
        return {
          cx,
          cy,
          dist,
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
    updateNodes() {
      this.nodes = this.makeNodeData();
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
          const count = _.chain(values).countBy(value => value).size().value();

          if (count >= 10) {
            // cut by 10
            const diff = (ret.max - ret.min) / 10;
            const halfDiff = diff / 2;
            for (let idx = 0; idx <= 10; idx += 1) {
              const key = (ret.min + (diff * idx) + (diff / 2)).toFixed(2);
              distribution[idx] = {
                key,
                count: 0,
              };
            }
            _.forEach(values, (v) => {
              const calcIdx = Math.floor((v - ret.min) / diff);
              distribution[calcIdx].count += 1;
            });
          } else {
            const diff = (ret.max - ret.min) / count;
            const halfDiff = diff / 2;
            for (let idx = 0; idx <= count; idx += 1) {
              const key = (ret.min + (diff * idx) + (diff / 2)).toFixed(2);
              distribution[idx] = {
                key,
                count: 0,
              };
            }
            _.forEach(values, (v) => {
              const calcIdx = Math.floor((v - ret.min) / diff);
              distribution[calcIdx].count += 1;
            });
            // cut by count
          }
          console.log('distribution', distribution);
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
          this.initDimensions();
          this.updateNodes();
          this.render();
        });
        reader.readAsText(file);
      });
    },
    async render() {
      await wait(1000);
      let draggingTarget = null;
      const that = this;
      const dimensions = d3.selectAll('g.dimension');
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
  },
};
