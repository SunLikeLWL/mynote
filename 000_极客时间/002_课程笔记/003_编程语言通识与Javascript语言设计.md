# 003_第二周_编程语言通识与Javascript语言设计



# 语言按语法分类


非形式语言

中文、英文



形式语言

0型 无限制文法

1型 上下文相关文法

2型 上下文无关文法

3型  正则文法


### 产生式BNF

1、用尖括号括起来的名称来表示语法结构名


2、语法结构分成基础结构和需要用其他语法结构定义的符合结构
      基础结构称终结符
      符合结构称非终结符

3、引号和中间的字符表示终结符

4、可以有括号

5、*表示重复多次

6、|表示或

7、+表示至少一次


<Number> = "0" | "1" | "2" |  ...... | "9"


<DecimalNumber> = "0" | (("1" | "2" | ......| "9") <Number>)


<PrimaryExpression> = <DecimalNumber> |
                                     "(" <LogicalExpression> ")"


<AdditiveExpression> = <DecimalNumber> |
                                        <Expression> "+" <DecimalNumber>
                                         <Expression> "-" <DecimalNumber>


<MultiplicativeExpression> = <DecimalNumber> | 
                                               <MultiplicativeExpression> "*" <DecimalNumber>
                                                 <MultiplicativeExpression> "/" <DecimalNumber>



<LogicalExpression> = <AdditiveExpression> |
                                     <LogicalExpression> "||" <AdditiveExpression>
                                     <LogicalExpression> "&&" <AdditiveExpression>


## 

四则运算:

1+2*3

终结符：

Number
+-*/

非终结符：
MultiplicativeExpression

AddtiveExpression


