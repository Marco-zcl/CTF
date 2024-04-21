import requests
import threading
from tqdm import tqdm

def test_proxy(proxy, valid_proxies, progress_bar):
    """
    检测代理是否可用
    """
    try:
        response = requests.get("http://httpbin.org/ip", proxies={"http": proxy, "https": proxy}, timeout=5)
        if response.status_code == 200:
            valid_proxies.append(proxy)
        progress_bar.update(1)
    except Exception as e:
        progress_bar.update(1)
        pass

def main(input_file, output_file):
    """
    主程序
    """
    with open(input_file, 'r') as f:
        proxies = f.readlines()
    
    valid_proxies = []
    threads = []

    progress_bar = tqdm(total=len(proxies), desc="Testing Proxies")

    for proxy in proxies:
        proxy = proxy.strip()
        thread = threading.Thread(target=test_proxy, args=(proxy, valid_proxies, progress_bar))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

    progress_bar.close()

    with open(output_file, 'w') as f:
        for valid_proxy in valid_proxies:
            f.write(valid_proxy + '\n')

if __name__ == "__main__":
    input_file = input("请输入IP代理池文件名：")
    output_file = "valid_proxies.txt"
    main(input_file, output_file)
