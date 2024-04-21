import re

def process_urls(input_file_name, output_file_name):
    with open(input_file_name, 'r') as input_file:
        lines = input_file.readlines()

    # 正则表达式来识别URL
    url_pattern = re.compile(r'(https?://\S+)')

    with open(output_file_name, 'w') as output_file:
        for line in lines:
            matches = url_pattern.findall(line)
            if matches:
                # 如果已经有 http 或 https 协议，直接输出
                output_file.write(line)
            else:
                # 否则添加 http 协议后输出
                new_line = 'http://' + line
                output_file.write(new_line)

def main():
    input_file_name = input("请输入要读取的文件名: ")
    output_file_name = input("请输入要输出的文件名: ")

    process_urls(input_file_name, output_file_name)

    print(f"处理完成，结果已保存到 {output_file_name} 文件中。")

if __name__ == "__main__":
    main()
