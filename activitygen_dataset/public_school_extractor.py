from selenium import webdriver
import pandas as pd
import time

DRIVER_PATH = './chromedriver.exe'
driver = webdriver.Chrome(executable_path=DRIVER_PATH)
driver.get('https://www.edu.gov.qa/en/Deputy/educationaffairs/Pages/GovSchoolsList.aspx')

table = driver.find_element_by_xpath(
    '//*[@id="ctl00_ctl58_g_f1047137_df8b_4401_a16e_f70f66f08b8e_ctl00_grd_GovSchools"]').get_attribute('outerHTML')
table_df = pd.read_html(table)
schools = table_df[0][['ID', 'School Name', 'School Manager', 'Location', 'School Level', 'EMail']][0:10]

for i in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 8, 9, 10, 11]:
    print(i)
    driver.execute_script(
        """document.querySelector("#ctl00_ctl58_g_f1047137_df8b_4401_a16e_f70f66f08b8e_ctl00_grd_GovSchools > tbody > tr:nth-child(12) > td > table > tbody > tr > td:nth-child({0}) > a").click()""".format(
            i))
    time.sleep(5)
    table = driver.find_element_by_xpath(
        '//*[@id="ctl00_ctl58_g_f1047137_df8b_4401_a16e_f70f66f08b8e_ctl00_grd_GovSchools"]').get_attribute('outerHTML')
    table_df = pd.read_html(table)
    temp_schools = table_df[0][['ID', 'School Name', 'School Manager', 'Location', 'School Level', 'EMail']][0:10]
    schools = schools.append(temp_schools)
