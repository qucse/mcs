# Data Setup
1. Download ShanghaiTech Dataset

   Dropbox: https://www.dropbox.com/s/fipgjqxl7uj8hd5/ShanghaiTech.zip?dl=0 
   
   Baidu Disk: http://pan.baidu.com/s/1nuAYslz
   
2. Create Directory 
  ```Shell
  mkdir ROOT/data/original/shanghaitech/  
  ```
3. Save "part_A_final" under ROOT/data/original/shanghaitech/
4. Save "part_B_final" under ROOT/data/original/shanghaitech/
5. cd ROOT/data_preparation/

   run create_gt_test_set_shtech.m in matlab to create ground truth files for test data
6. cd ROOT/data_preparation/

   run create_training_set_shtech.m in matlab to create training and validataion set along with ground truth files

# Test
1. Follow steps 1,2,3,4 and 5 from Data Setup
2. Download pre-trained model files:

   [[Shanghai Tech A](https://www.dropbox.com/s/irho4laltre9ir5/cmtl_shtechA_204.h5?dl=0)]
   
   [[Shanghai Tech B](https://www.dropbox.com/s/lkt5ipshibs027w/cmtl_shtechB_768.h5?dl=0)]
   
   Save the model files under ROOT/final_models

