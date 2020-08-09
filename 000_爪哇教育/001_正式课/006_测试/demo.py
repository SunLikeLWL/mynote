# -*- coding:utf-8  -*-
# unittest 不用安装直接引入
import unittest
# 时间模块
import time
# 用于辅助生成测试报告,本地copy文件后，一定要移动到python的安装目录下。python安装目录如何查看：import sys => sys.path
import HTMLTestRunner
from selenium import webdriver
# 常用键盘的Keys
# Keys.CONTROL control 键
# Keys.SPACE 空格键...
from selenium.webdriver.common.keys import Keys

# 打开网页
web = webdriver.Chrome()
web.maximize_window()
web.get('https://www.runoob.com/')

class UserTestCase(unittest.TestCase):
    # setUp -> case -> tearDown
    # 每个自动化测试用例开始都会执行的函数，参数都传self
    def setUp(self):
        print('---setUp---')
    # 每个自动化测试用例结束都会执行的函数，参数都传self
    def tearDown(self):
        print('----tearDown----')
    # 普通测试用例,成功会输出. 失败会输出F。测试用例的命名要以test_开头
    def test_firstCase(self):
        web.find_element_by_css_selector('#s').send_keys('hello world')
        res = web.find_element_by_css_selector('#s').get_attribute('value')
        # 常用断言api有以下几种
        # self.assertEqual() 是否相等
        # self.assertTrue() 是否为true
        # self.assertFalse() 是否为false
        self.assertEqual(res,'hello')
        print('firstCase')
    def test_secondCase(self):
        self.assertEqual(1,1,msg='值不相等')
        print('secondCase')
    def test_thirdCase(self):
        print('do anything')

if __name__ == '__main__':
    # unittest.main()
    # TestSuite测试套件，保证测试用例的执行顺序。
    suite = unittest.TestSuite()
    suite.addTest(UserTestCase('test_thirdCase'))
    suite.addTest(UserTestCase('test_secondCase'))
    suite.addTest(UserTestCase('test_firstCase'))
    
    # 格式化测试用例报告的文件名
    file_prefix = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
    # 创建文件句柄，写入测试用例报告并且格式化为HTML文件
    fp = open("./"+file_prefix+"_result.html","wb")
    runner = HTMLTestRunner.HTMLTestRunner(stream=fp,title=u"第一份测试报告",description=u"测试详情")
    runner.run(suite)
    fp.close()