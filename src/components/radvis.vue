<template lang="pug">
  .radvis-field
    .section
      input(type='file')#fileInput
      .main-title Improved exploration with dimensional weight manipulation in RadViz
      .support-text This system is optimized for the Chrome browser with 1920 x 1200 resolution.
      .graph-field
        .selection-dimension-group
          .command(v-on:click="onSelectFileButton") Generate RADVIS from csv file
          .category NODE SETTINGS
          .flex-group
            .flex-name.large Node Opacity
            input(v-model="nodeOpacity", type="number", min="0",max="100",step="10")
          .flex-group
            .flex-name.large Node Radius
            input(v-model="nodeRadius", type="number")
          .category-end
          .category DIMENSION SETTINGS
          .flex-group
            .flex-name.large Dimension FontSize
            input(v-model="dimensionFontSize")
          .flex-group
            .flex-name High Color
            input(type="color", v-model="color.end.hex", v-on:change="updateNodes")
            <!--picker(v-model="color.end", v-on:input="updateNodes")-->
          .flex-group
            .flex-name Low Color
            input(type="color", v-model="color.start.hex", v-on:change="updateNodes")
            <!--picker(v-model="color.start", v-on:input="updateNodes")-->
          .category-end
          .category SELECTED DIMENSION
          .group-info(v-if="isSelectedDimension")
            .flex-group
              .flex-name NAME
              .flex-text : {{selectDimension.name}}
            .flex-group
              .flex-name ANGLE
              .flex-text : {{selectDimension.angle.toFixed(1)}}'
            .flex-group
              .flex-name MIN
              .flex-text : {{selectDimension.min.toFixed(2)}}
            .flex-group
              .flex-name MAX
              .flex-text : {{selectDimension.max.toFixed(2)}}
            .flex-group
              .flex-name SIGMA
              .flex-text : {{selectDimension.sigma.toFixed(2)}}
            .category.small DIMENSION ACTION
            .command(v-on:click="setColorDimensionCurrentDimension") Set Color Dimension
            .command(v-if="selectDimension.usage",
            v-on:click="changeDimensionUsage(selectDimension)").
              Disable Dimension
            .command(v-if="!selectDimension.usage",
            v-on:click="changeDimensionUsage(selectDimension)").
              Activate Dimension
            .category.small NODE DISTRIBUTION [{{getNodeDistributionGraph}}]
            svg.distribution
          .category-end
          .category Logging Field
          .flex-group.debug
            .flex-name isSelect Dimension
            .flex-text : {{isSelectedDimension}}
          .flex-group.debug
            .flex-name Start Color
            .flex-text : {{color.start.hex}}
          .flex-group.debug
            .flex-name End Color
            .flex-text : {{color.end.hex}}
          .flex-group.debug
            .flex-name Color Std Dimension
            .flex-text : {{colorDimension.text}}
          .flex-group.debug
            .flex-name Dimension Cluster Size
            .flex-text : {{clusters.length}}
        .svg-group
          svg.radvis
            g#filter
              rect(x="0", y="0", width="1200px", height="1080px", fill="rgba(255,255,255,0)")
            g.gBackground(v-bind:transform="getRadvisCenterTransform")
              circle(cx="0", cy="0", r="400", fill="none", stroke="#333", stroke-dasharray="3,6")
            g.gDimensions(v-bind:transform="getRadvisCenterTransform")
              template(v-for="dimension in dimensions")
                g.dimension.controll(v-bind:transform="'translate(' + dimension.x + ','+ dimension.y +')'",
                v-bind:uid="dimension.uid",
                v-bind:class="{selection : selectDimension === dimension, disable : !dimension.usage}")
                  g(v-bind:transform="getDimensionGroupAngle(dimension.angle)")
                    text.dimension(v-bind:transform="getDimensionTextTransform(dimension.angle)",
                    alignment-baseline="middle", v-bind:font-size="dimensionFontSize").
                      {{dimension.text}}
                    <!--circle.colorDimension(v-if="dimension === colorDimension",-->
                    <!--v-bind:stroke="color.end.hex")-->
                  circle.inner
                  circle.dimension-normal(v-bind:r="dimension.selected ? 12 : 8")
                  rect(v-if="dimension === colorDimension",
                  width="8px", height="8px", x="35px", y="-35px",
                  v-bind:transform="'rotate(' + (dimension.angle + 45 )+ ')'",
                  v-bind:fill="color.end.hex", stroke="none")
                  rect(v-if="dimension === colorDimension",
                  width="8px", height="8px", x="25px", y="-45px",
                  v-bind:transform="'rotate(' + (dimension.angle + 45 )+ ')'",
                  v-bind:fill="color.start.hex", stroke="none")
            g.gNodes(v-bind:transform="getRadvisCenterTransform")
              template(v-for="node in nodes")
                circle.node(v-bind:cx="node.cx",v-bind:cy="node.cy",v-bind:opacity="node.opacity",
                v-bind:fill="node.fill", v-bind:r="nodeRadius")
            g#filterDrawZone(v-bind:transform="getRadvisCenterTransform")
              rect.filter(v-if='filter.usage', v-bind='getFilterRect')
          //.group-padding
            svg.parallel
              g.axis(transform='translate(10,0)')
                template(v-for="(dimension,i) in dimensions")
                  line(v-bind:x1="1100 / (dimensions.length - 1) * i",
                  v-bind:x2="1100 / (dimensions.length - 1) * i",
                  v-bind:y1="0",
                  v-bind:y2="300", stroke="#aaa", stroke-width="1px")
              g.lines(transform='translate(10,0)')
                template(v-for="line in getLineData")
                  path(v-bind:d="lining(line.coord)", fill="none", stroke-width="2",
                  v-bind:stroke="line.color", opacity="0.2")
        .side-view
          input(type='checkbox', v-model="fillRadvis" , v-on:change="onFillRadvis")
          .flex-group
            input.cluster-number(type='number', v-model="makeClusterCount")
            .command(v-on:click="doClusterDimension") Dimension Clustering
          .category.use-carret(v-on:click="convertUsageViewOption('useCorrelationMatrix')",
          v-bind:class="{opened : viewOption.useCorrelationMatrix}")
            .text Dimension Correlation
            i.material-icons expand_more
          .correlation-field(v-if="viewOption.useCorrelationMatrix")
            .first-group
              template(v-for="dimension in dimensions")
                .name-horizontal(v-if="dimension.usage")
                  .name {{dimension.name}}
              .empty-group
            template(v-for="dimension in dimensions")
              .correlation-group(v-if="dimension.usage",v-bind:style="{ height : (264 / getActiveDimensionSize()) + 'px'}")
                template(v-for="target in dimensions")
                  .correlation-block(v-if="getDimensionByName(target.name).usage")
                    .circle(v-bind:style="{ background : getCorrelationColor(dimension.correlation[target.name]) }")
                .name-vertical
                  .name {{dimension.name}}
            .correlation-group.cluster
              template(v-for="(cluster, i) in clusters")
                template(v-for="(dimension, j) in cluster.dimensions")
                  .correlation-block.cluster(v-bind:style="{ background : colorDimensionCluster(i, clusters.length) }",
                  v-bind="{index:j}")
              .name-vertical
          .category.use-carret(v-on:click="convertUsageViewOption('useDimensionCluster')",
          v-bind:class="{opened : viewOption.useDimensionCluster}")
            .text Dimension Clusters
            i.material-icons expand_more
          .group-dimension-cluster(v-if="viewOption.useDimensionCluster")
            template(v-for="(cluster, i) in clusters")
              .flex-group.debug
              .flex-group-dimension
                .flex-cluster-color(v-bind:style="{ background : colorDimensionCluster(i, clusters.length) }")
                .flex-dimension-list
                  template(v-for="dimension in cluster.dimensions")
                    .flex-dimension(v-bind:class="{selected : dimension === selectDimension.name}", v-on:click="setSelectDimension(dimension)") {{dimension}}
          .category Nodes Radar
          svg.radarChart
            g.gNodes(transform="translate(173,173), scale(0.38)")
              template(v-for="path in paths")
                path(v-bind="path")
            g.gDimensions(transform="translate(170,170), scale(0.35)")
              circle(r="400",cx="0",cy="0",fill="none",stroke="#666")
              template(v-for="dimension in dimensions")
                line(x1='0',y1='0',v-bind:x2="dimension.x",
                v-bind:y2="dimension.y",stroke="rgba(0,0,0,0.5)",
                v-if="dimension.usage")
                g.dimension(v-bind:transform="'translate(' + dimension.x + ','+ dimension.y +')'",
                v-if="dimension.usage",
                v-bind:uid="dimension.uid",
                v-bind:class="{selection : selectDimension === dimension, disable : !dimension.usage}")
                  g(v-bind:transform="getDimensionGroupAngle(dimension.angle)")
                    line(x1='-15',y1='90',x2="15",v-bind:y2="90",stroke="rgba(0,0,0,0.3)" , stroke-width="3px")
                    line(x1='-15',y1='180',x2="15",v-bind:y2="180",stroke="rgba(0,0,0,0.3)" , stroke-width="3px")
                    line(x1='-15',y1='270',x2="15",v-bind:y2="270",stroke="rgba(0,0,0,0.3)" , stroke-width="3px")
                    text.dimension(v-bind:transform="getDimensionTextTransform(dimension.angle)",
                    alignment-baseline="middle", v-bind:font-size="dimensionFontSize * 1.6").
                      {{dimension.text}}
                  circle.inner
                  circle.dimension-normal(v-bind:r="dimension.selected ? 12 : 8")
    .selected-table-view
      vue-good-table(:columns="columns", :rows="getSelectedData", :search-options="{ enabled: true, }",
      :pagination-options="tableOption.pagination", styleClass="vgt-table striped bordered")

</template>

<script>


import radvis from './radvis';


export default radvis;

</script>

<style lang="sass">

.vgt-responsive
  height : 150px !important
  overflow: hidden

.vgt-table th, .vgt-table td
  padding: 4px 8px !important
  font-size: 12px !important

.selected-table-view
  width: 1896px

@import "../style/global"
.section
  position: relative

.main-title
  width: 100%
  height: 40px
  text-align: center
  position: absolute
  font-size: 14px
  line-height: 40px
  pointer-events: none
  color: #666
  left: 0
  top: 0

.support-text
  width: 100%
  height: 40px
  text-align: center
  position: absolute
  font-size: 14px
  line-height: 40px
  pointer-events: none
  left: 0
  bottom: 0
  font-style: italic
  color: #999
$border-color: #ddd
.vc-compact
  width: 210px !important

.vc-compact-colors
  width: 220px !important

.vc-compact-color-item
  width: 12px !important
  height: 12px !important

.vc-compact-dot
  left: 2px !important
  top: 2px !important
  bottom: 2px !important
  right: 2px !important

circle.node
  pointer-events: none
  transition: all 0.3s

input[type='file']
  display: none

.group-padding
  width: 100%
  &:first-child
    padding-bottom: 0
  background: #eee

svg.radarChart
  width: 340px
  height: 340px
  background: #fff
  border: solid 1px #eee

rect.filter
  fill: none
  stroke-dasharray: 2, 2
  stroke: #555
  stroke-width: 1px

input[type=number]
  width: 50px
  border: none
  color: #555
  font-weight: 600
  border-bottom: solid 2px $md-grey-600
  text-align: center
  transition: border .2s, background .2s
  &:focus, &:active
    background: #f6f6f6
    border: none
    outline: none
    border-bottom: solid 2px $md-pink-600
  &.cluster-number
    margin-top: 8px
    height: 32px
    font-size: 14px
    width: 100px
    margin-right: 12px

g#filterDrawZone
  pointer-events: none

svg
  text.central
    text-anchor: middle
    alignment-baseline: middle
  text.power-applier-text
    font-size: 12px
    font-weight: 600

g.dimension
  cursor: pointer
  circle
    transition: stroke .3s, fill .3s, transform .3s
  circle.dimension-normal
    stroke: #555
    stroke-width: 2px
    fill: none
    transition: r 0.3s
  circle.inner
    stroke: none
    r: 4px !important
    fill: #555
  text.dimension
    transition: fill .3s, transform .2s, font-size .3s
    text-anchor: middle
  &.selection
    text
      fill: #C2185B
    circle.dimension-normal
      fill: none
      stroke: #C2185B
    circle.inner
      fill: #C2185B
      stroke: none
      r: 6px
  circle.colorDimension
    r: 15px
    fill: none
    stroke-width: 2px

g.dimension.disable
  circle
    stroke: #ccc !important
    stroke-width: 1px !important
  circle.inner
    fill: none !important
  text
    fill: #ccc !important

text
  @include disable-selection

.empty-flex
  flex: 1

svg.distribution
  width: 100%
  height: 220px

text.dimensionKey
  font-size: 9px

path.power-applier
  stroke: #000
  stroke-width: 3px
  fill: none,

circle.power-applier
  r: 3
  stroke: #333
  fill: rgba(255, 255, 255, 1)
  stroke-width: 2px
  cursor: pointer
  transition: r .3s, fill .3s
  &:hover
    r: 5
    fill: rgba(255, 255, 255, 1)

.graph-field
  height: 1080px
  display: flex
  .selection-dimension-group
    color: #666
    font-size: 16px
    height: 100%
    width: 340px
    padding: 8px 0
    border-right: solid 1px $border-color
  .dimension-group
    width: 440px
    height: 100%
  .svg-group
    width: 1180px
    height: 1080px
    svg.radvis
      width: 1080px
      height: 1080px
    svg.parallel
      padding: 12px
      height: 250px
      width: 100%
  .side-view
    overflow-y: scroll
    overflow-x: hidden
    border-left: solid 1px $border-color
    padding: 8px
    width: 376px
    height: 100%

.category.use-carret
  cursor: pointer
  display: flex
  &:hover
    color: #333
  &.opened
    i
      opacity: 0
  i
    text-align: center
    height: 20px
    line-height: 20px
    transition: opacity .3s
    width: 40px
    opacity: 1

.category
  font-size: 11px
  color: #777
  line-height: 20px
  font-weight: 500
  padding: 8px 16px 6px 16px
  &.small
    color: #888
    border: none
    padding: 8px 16px 0
    font-size: 12px
    .command
      color: #555

.category-end
  margin-top: 24px
  border-bottom: solid 1px $border-color

.command
  height: 32px
  border-radius: 16px
  padding: 0 12px
  text-align: center
  line-height: 32px
  margin: 8px
  font-weight: 500
  font-size: 14px !important
  cursor: pointer
  transition: background-color .3s, box-shadow .3s
  border: solid 1px #ccc
  &:hover
    background: #fcfcfc
    @include card-box-shadow-light

.correlation-field
  width: 339px
  height: 339px
  background: #fff
  padding: 10px
  .first-group
    display: flex
    height: 60px
    align-items: right
    .empty-group
      background: #fff
      width: 60px
    .name-horizontal
      flex: 1
      overflow: hidden
      font-size: 10px
      align-items: center
      position: relative
      .name
        text-align: right
        text-overflow: ellipsis
        overflow: hidden
        width: 100% !important
        transform: rotate(90deg)
  .correlation-group
    border-bottom: solid 1px #fff
    font-size: 12px
    display: flex
    &.cluster
      height: 12px
    .name-vertical
      font-size: 10px
      padding-left: 4px
      width: 60px
      overflow: hidden
      display: flex
      align-items: center
      .name
        width: 100%
        padding-right: 5px
    .correlation-block
      flex: 1
      border-left: solid 1px #fff
      position: relative
      &.cluster
        height: 6px
        margin-top: 1px
        border-left: solid 1px rgba(255, 255, 255, 0.1)
        &[index='0']
          border-left: solid 1px #fff
      .circle
        position: absolute
        width: calc(100% - 20%)
        height: calc(100% - 20%)
        margin: 10%
        border-radius: 50%

.flex-group-dimension
  display: flex
  padding: 0 16px
  .flex-cluster-color
    width: 4px
  .flex-dimension-list
    flex: 1
    display: flex
    justify-content: left
    flex-direction: row
    flex-wrap: wrap
    flex-flow: row wrap
    align-content: flex-end
    .flex-dimension
      width: auto
      padding: 4px 8px
      border: solid 1px #e3e3e3
      font-size: 11px
      font-weight: 500
      cursor: pointer
      &:hover
        background: #f0f0f0
      &.selected
        background: $border-color
        color: #333

.flex-group
  font-size: 14px
  display: flex
  line-height: 1.5
  padding: 0 16px
  margin: 6px 0
  .flex-name
    padding: 0 8px
    font-weight: 600
    width: 90px !important
    overflow: hidden
    white-space: nowrap
    &.large
      width: 180px !important
      overflow: hidden
      white-space: nowrap
  .flex-text
    flex: 1
  &.debug
    line-height: 1.25
    font-size: 12px
    .flex-name
      width: 150px !important
      border-left: solid 2px #0288D1

.upload-button
  width: 100%
  height: 48px
  background: #f00
  color: #fff
  text-align: center
  line-height: 48px


</style>
