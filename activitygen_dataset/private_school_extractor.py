from selenium import webdriver
import pandas as pd
import time
DRIVER_PATH = './chromedriver.exe'
driver = webdriver.Chrome(executable_path=DRIVER_PATH)
driver.get('https://www.edu.gov.qa/en/Pages/PrivateSchoolSearch.aspx')
driver.find_element_by_xpath(
    '//*[@id="ctl00_ctl58_g_d24b0b7f_5563_4344_9259_4be759caaf1d_ctl00_btn_Search_Txt"]').click()

schools = pd.DataFrame(columns=['School Name', 'Educational Curriculum', 'Region', 'School Type'])

for i in [2,3,4,5,6,7,8,9,10,11,4,5,6,7,8,9,10,11,12,13,4,5,6,7,8,9,10,11,12,13,9,10,11,12] :
    print(i)
    driver.execute_script(
        """document.querySelector("#ctl00_ctl58_g_d24b0b7f_5563_4344_9259_4be759caaf1d_ctl00_gv_AllSchools > tbody > tr.footerRow > td > table > tbody > tr > td:nth-child({0}) > a").click()""".format(i))
    time.sleep(5)
    table = driver.find_element_by_xpath(
        '//*[@id="ctl00_ctl58_g_d24b0b7f_5563_4344_9259_4be759caaf1d_ctl00_gv_AllSchools"]').get_attribute('outerHTML')
    table_df = pd.read_html(table)
    temp_schools = table_df[0][['School Name', 'Educational Curriculum', 'Region', 'School Type']].iloc[0:10]
    schools = schools.append(temp_schools)
