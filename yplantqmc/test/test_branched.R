# 加载YplantQMC库
library(YplantQMC)

# 定义文件路径
leaf_file <- "D:/Programming/Projects/SmartPlants/yplantqmc/python/output/My_Leaf.L"
branched_plant_file <- "D:/Programming/Projects/SmartPlants/yplantqmc/output/Branched_Plant.P"

# 检查文件是否存在
cat("Checking if files exist:\n")
cat("My_Leaf.L exists:", file.exists(leaf_file), "\n")
cat("Branched_Plant.P exists:", file.exists(branched_plant_file), "\n\n")

# 测试叶子文件中的中脉点
test_leaf_midrib <- function(file_path) {
  cat("Testing leaf file for midrib points...\n")
  
  # 读取L文件
  lines <- readLines(file_path)
  n_points <- as.numeric(lines[2])
  
  # 提取点的坐标
  points <- list()
  for (i in 1:n_points) {
    point_line <- lines[2 + i]
    coords <- as.numeric(strsplit(point_line, "\\s+")[[1]])
    points[[i]] <- coords
  }
  
  # 找到所有x=0的点（中脉点）
  midrib_indices <- c()
  for (i in 1:length(points)) {
    if (points[[i]][1] == 0) {
      midrib_indices <- c(midrib_indices, i)
    }
  }
  
  # 输出中脉点信息
  if (length(midrib_indices) > 0) {
    cat("Found", length(midrib_indices), "midrib points (X=0) at indices:", midrib_indices, "\n")
    for (idx in midrib_indices) {
      cat("  Point", idx, ":", points[[idx]][1], points[[idx]][2], "\n")
    }
    cat("✓ Leaf file has midrib points (X=0)\n")
  } else {
    cat("❌ No midrib points found in leaf file!\n")
  }
  
  # 绘制叶子轮廓
  x_coords <- sapply(points, function(p) p[1])
  y_coords <- sapply(points, function(p) p[2])
  plot(x_coords, y_coords, type="l", xlab="X", ylab="Y", main="Leaf Contour")
  points(x_coords, y_coords, col="blue", pch=19)
  points(0, 0, col="red", pch=17, cex=2)  # 起点标记
  
  return(length(midrib_indices) > 0)
}

# 构建分支植物
construct_plant <- function() {
  cat("\nConstructing branched plant...\n")
  
  # 使用我们自己创建的P文件
  tryCatch({
    branched_plant <- constructplant(branched_plant_file, leaf_file)
    cat("✓ Successfully constructed branched plant\n")
    
    # 显示植物结构
    plot(branched_plant, main="Branched Plant Structure")
    return(TRUE)
  }, error=function(e) {
    cat("❌ Error constructing branched plant:", e$message, "\n")
    return(FALSE)
  })
}

# 运行测试
cat("\n===== TESTING BRANCHED PLANT =====\n\n")
leaf_ok <- test_leaf_midrib(leaf_file)
if (leaf_ok) {
  plant_ok <- construct_plant()
}

cat("\nTest completed.\n") 