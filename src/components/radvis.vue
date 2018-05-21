<template lang="pug">
  .section
    input(type='file')#fileInput
    .graph-field
      .selection-dimension-group
        .command(v-on:click="onSelectFileButton") Generate RADVIS from csv file
        .category Color
        .flex-group
          .flex-name.large Dimension FontSize
          input(v-model="dimensionFontSize", type="number")
        .flex-group
          .flex-name High Color
          picker(v-model="color.end", v-on:input="updateNodes")
        .flex-group
          .flex-name Low Color
          picker(v-model="color.start", v-on:input="updateNodes")
        .category-end
        .category Selected Dimension
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
          .category.small Dimension Action
          .command(v-on:click="setColorDimensionCurrentDimension") Set Color Dimension
          .command(v-if="selectDimension.usage",
          v-on:click="changeDimensionUsage(selectDimension)").
            Disable Dimension
          .command(v-if="!selectDimension.usage",
          v-on:click="changeDimensionUsage(selectDimension)").
            Activate Dimension
          .category.small Node Distribution
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
          g.gBackground(v-bind:transform="getRadvisCenterTransform")
            circle(cx="0", cy="0", r="400", fill="none", stroke="#333", stroke-dasharray="3,6")
          g.gDimensions(v-bind:transform="getRadvisCenterTransform")
            template(v-for="dimension in dimensions")
              g.dimension(v-bind:transform="'translate(' + dimension.x + ','+ dimension.y +')'",
              v-bind:uid="dimension.uid",
              v-bind:class="{selection : selectDimension === dimension, disable : !dimension.usage}")
                g(v-bind:transform="getDimensionGroupAngle(dimension.angle)")
                  text.dimension(
                  v-bind:transform="getDimensionTextTransform(dimension.angle)",
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
              circle.node(v-bind="node")
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
        .category Dimension Correlation
        .correlation-field
          .first-group
            .empty-group
            template(v-for="dimension in dimensions")
              .name-horizontal(v-if="dimension.usage")
                .name {{dimension.name}}
          template(v-for="dimension in dimensions")
            .correlation-group(v-if="dimension.usage",v-bind:style="{ height : (264 / getActiveDimensionSize()) + 'px'}")
              .name-vertical
                .name {{dimension.name}}
              template(v-for="target in dimensions")
                .correlation-block(v-if="getDimensionByName(target.name).usage",
                v-bind:style="{ background : getCorrelationColor(dimension.correlation[target.name]) }")
        .flex-group
          input(type='number', v-model="makeClusterCount")
          .command(v-on:click="doClusterDimension") Dimension Clustering
        .category Dimension Clusters
        template(v-for="(cluster, i) in clusters")
          .flex-group.debug
          <!--.flex-name Dimension Cluster [{{i}}]-->
          .flex-group
            template(v-for="dimension in cluster.dimensions")
              .flex-text {{dimension}}
    <!--.test(style="padding:12px; font-size:12px; color:#666; white-space:nowrap;") {{dimensions}}-->
</template>

<script>

import radvis from './radvis';

export default radvis;

</script>

<style lang="sass">


@import "../style/global"

$border-color : #ccc
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
  transition: all 0.3s

input[type='file']
  display: none

.group-padding
  width: 100%
  &:first-child
    padding-bottom: 0
  background: #eee

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
  height: 120px
  border: solid 1px #eee

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
    border-left: solid 1px $border-color
    padding: 8px
    width: 376px
    height: 100%

.category
  font-size: 14px
  color: #777
  line-height: 20px
  font-weight: 800
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
      padding-top: 20px
      .name
        width: 100% !important
        transform: rotate(90deg)
  .correlation-group
    border-bottom: solid 1px #fff
    font-size: 12px
    display: flex
    .name-vertical
      font-size: 10px
      border-right: solid 1px #f0f0f0
      width: 60px
      overflow: hidden
      display: flex
      align-items: center
      .name
        width: 100%
        text-align: right
        padding-right: 5px
    .correlation-block
      flex: 1
      border-left: solid 1px #fff

.flex-group
  font-size: 14px
  display: flex
  line-height: 1.5
  padding: 0 16px
  margin: 6px 0
  .flex-name
    padding: 0 8px
    border-left: solid 2px #42b983
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
  .flex-dimension
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
