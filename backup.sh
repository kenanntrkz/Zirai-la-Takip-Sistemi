#!/bin/bash

# Yedekleme klasörü oluştur
backup_dir="zirai_ilac_takip_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# Proje dosyalarını kopyala
cp -r \
  src/ \
  public/ \
  package.json \
  tsconfig.json \
  vite.config.ts \
  index.html \
  README.md \
  .env \
  "$backup_dir/"

# Yedekleme dosyasını ZIP olarak arşivle
zip -r "${backup_dir}.zip" "$backup_dir"

# Geçici klasörü temizle
rm -rf "$backup_dir"

echo "Yedekleme tamamlandı: ${backup_dir}.zip"