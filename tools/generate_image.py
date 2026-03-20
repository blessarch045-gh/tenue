#!/usr/bin/env python3
"""
tenue Instagram画像生成スクリプト
Gemini Imagen API で画像を生成し、直接プロジェクトフォルダに保存する。

使い方:
  python3 tools/generate_image.py \
    --prompt "プロンプトテキスト" \
    --output "マーケティング/Instagram/画像/Week3_4月1日_xxx.png" \
    [--aspect 1:1] \
    [--count 1]

環境変数:
  GEMINI_API_KEY: Google AI Studio の API キー（.env に設定）
"""

import argparse
import base64
import os
import sys
from pathlib import Path

# .env からAPIキーを読み込む
def load_env():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

load_env()

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: google-genai がインストールされていません。")
    print("  pip3 install google-genai")
    sys.exit(1)

# tenue ブランド共通スタイル（プロンプトに自動付加）
BRAND_STYLE = (
    "水彩タッチのイラスト風。暖色系（アイボリー・ベージュ・テラコッタ）。"
    "少女マンガ的な繊細さ。20〜30代の日本人女性（横顔または後ろ姿）。"
    "文字なし・テキストなし。高品質・Instagram映え。"
)

ASPECT_MAP = {
    "1:1":  "1:1",
    "9:16": "9:16",
    "16:9": "16:9",
}

def generate(prompt: str, output_path: str, aspect: str = "1:1", count: int = 1):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY が設定されていません。")
        print("  .env に GEMINI_API_KEY=your_key_here を追加してください。")
        print("  APIキーの取得: https://aistudio.google.com/apikey")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    full_prompt = f"{prompt} {BRAND_STYLE}"
    aspect_ratio = ASPECT_MAP.get(aspect, "1:1")

    print(f"生成中: {output_path}")
    print(f"プロンプト: {prompt[:60]}...")
    print(f"アスペクト比: {aspect_ratio}, 枚数: {count}")

    # gemini-2.5-flash-image は generateContent で画像を返す
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    # 画像パーツを抽出
    image_parts = [
        part for part in response.candidates[0].content.parts
        if part.inline_data is not None
    ]

    if not image_parts:
        print("ERROR: 画像が生成されませんでした。プロンプトを変えて再試行してください。")
        sys.exit(1)

    # count 指定の場合は複数回呼ぶ設計だが、1回1枚が基本
    saved = []
    for i, part in enumerate(image_parts):
        if count == 1 or len(image_parts) == 1:
            path = Path(output_path)
        else:
            p = Path(output_path)
            path = p.parent / f"{p.stem}_{i+1}{p.suffix}"

        path.parent.mkdir(parents=True, exist_ok=True)
        import base64
        image_bytes = base64.b64decode(part.inline_data.data)
        path.write_bytes(image_bytes)
        size_kb = path.stat().st_size // 1024
        print(f"✅ 保存完了: {path} ({size_kb}KB)")
        saved.append(str(path))

    return saved


def main():
    parser = argparse.ArgumentParser(description="tenue Instagram画像生成")
    parser.add_argument("--prompt", required=True, help="画像プロンプト（日本語可）")
    parser.add_argument("--output", required=True, help="保存先パス（.png）")
    parser.add_argument("--aspect", default="1:1", choices=["1:1", "9:16", "16:9"],
                        help="アスペクト比（デフォルト: 1:1）")
    parser.add_argument("--count", type=int, default=1, help="生成枚数（デフォルト: 1）")
    args = parser.parse_args()

    generate(args.prompt, args.output, args.aspect, args.count)


if __name__ == "__main__":
    main()
