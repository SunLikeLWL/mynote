# flex 布局


使用flex布局首先要设置父容器 display: flex;然后设置justify-content:center；
实现水平居中，最后设置align-items:center 实现垂直居中


### justify-content

设置子容器沿主轴方向排列


flex-start: 起始端对齐

flex-end：末尾端对齐

center: 居中对齐

space-around:子容器沿主轴均匀分布，两端间隔少一半

space-between:子容器沿主轴均匀分布，首尾容器与父容器无间隔




### 设置子容器如何沿交叉轴排列 align-items

flex-start：起始端对齐

flex-end： 末尾端对齐

center： 居中对齐

baseline：基线对齐

stretch：子容器沿交叉轴方向的尺寸拉伸至于父容器一致


### flex-direction: row

轴排列方式


row: 主轴方向排列

column: 侧轴方向排列 


### flex-wrap

是否换行

nowrap: 不换行

wrap: 换行

wrap-reverse： 逆行换行

