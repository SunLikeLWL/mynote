# Javascript数据结构与算法-视频教程


# 数据结构定义

1、在计算机中组织和存储数据的方式



# 算法定义

1、一个有限指令集，每条指令的描述不依赖于语言
2、接收一些输入（有些情况下不需要输入）
3、产出输出
4、一定在有限步骤之后终止


# 数组

1、join();// 将数组合并成字符串


2、push()/pop();// 从数组尾部添加移除元素

3、unshift()/shift();// 从数组头部添加移除元素


4、sort();// 排序

5、reverse();//反转数组

6、concat();// 合并数组并返回一个新的数组

7、slice();// 截图数组并返回

8、splice();//可以实现数组的元素的删除、插入和替换

9、IndexOf()/LastIndexOf();// 获取元素所在的第一下表/最后一个下标

10、forEach();// 遍历数组，并给定每个元素一个函数，没有返回值

11、map();// 对数组每一项运行给定函数，返回每次函数调用的结果组成的数组

12、filter();// 数组中的每一项运行给定的数组，返回，满足条件组成的数组

13、every();// 判断每一项是否都满足条件，只有所有的条件都满足才会返回true

14、some();// 判断是否有满足条件，只要有条件满足就会返回true

15、reduce()和reduceRight()

var arr = [23432,4,324];

arr.reduce(function(pre,cur,index,items){
  return pre+cur;
},初始值)


reduce和reduceRight区别

reduce正向遍历

reduceRight反向遍历


