import os
import random
import string

def generate_random_filename(length=8):
    """Generate a random filename."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length)) + ".txt"

def filter_unique_urls(input_file):
    # 读取文件内容
    with open(input_file, 'r') as f:
        lines = f.readlines()

    # 使用集合去除重复的URL
    unique_urls = set(lines)

    # 写入剩余内容到随机文件中
    output_file = generate_random_filename()
    with open(output_file, 'w') as f:
        f.writelines(unique_urls)

    return output_file

def main():
    input_file = input("请输入要读取的txt文件名：")
    if not os.path.exists(input_file):
        print("文件不存在！")
        return
    output_file = filter_unique_urls(input_file)
    print("筛选后的URL已保存到文件：", output_file)

if __name__ == "__main__":
    main()
