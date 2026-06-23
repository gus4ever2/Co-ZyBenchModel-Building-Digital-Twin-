library(YplantQMC)

# Define absolute paths
base_dir <- "D:/Programming/Projects/SmartPlants/yplantqmc"
sugarmaple_p_file <- file.path(base_dir, "test", "Sugarmaple.P")
leaf_file <- file.path(base_dir, "python", "output", "My_Leaf.L")
plant_file <- file.path(base_dir, "python", "output", "My_Plant.P")

# Print the paths to verify
cat("Sugarmaple P file:", sugarmaple_p_file, "\n")
cat("Leaf file:", leaf_file, "\n")
cat("Plant file:", plant_file, "\n")

# Check if files exist
cat("Sugarmaple P exists:", file.exists(sugarmaple_p_file), "\n")
cat("Leaf file exists:", file.exists(leaf_file), "\n")
cat("Plant file exists:", file.exists(plant_file), "\n")

# Test leaf file
tryCatch({
  coords <- readl_test(leaf_file)
  cat("成功读取叶子文件!\n")
}, error = function(e) {
  cat("读取叶子文件时出错:", conditionMessage(e), "\n")
})

# Test P file
tryCatch({
  readp_test(plant_file)
  cat("成功读取P文件!\n")
}, error = function(e) {
  cat("读取P文件时出错:", conditionMessage(e), "\n")
})

# Define helper functions
readl_test <- function(lfile) {
  # 读取文件
  lines <- readLines(lfile)
  
  # 解析点的数量
  n_points <- as.integer(lines[2])
  
  # 解析坐标
  coords <- matrix(NA, nrow=n_points, ncol=2)
  for (i in 1:n_points) {
    line_parts <- strsplit(lines[i+2], " ")[[1]]
    coords[i, 1] <- as.numeric(line_parts[1])
    coords[i, 2] <- as.numeric(line_parts[2])
  }
  
  # 检查是否有X=0的点
  midrib_points <- which(abs(coords[,1]) < 1e-6)
  
  if (length(midrib_points) < 1) {
    stop("Leaf needs a point on the midrib where X=0.")
  }
  
  # 打印所有X=0的点
  cat("找到", length(midrib_points), "个X=0的点，索引:", midrib_points, "\n")
  for (idx in midrib_points) {
    cat("  点", idx, ":", coords[idx,1], coords[idx,2], "\n")
  }
  
  # 绘制叶子轮廓
  plot(coords[,1], coords[,2], type="l", asp=1, 
       main="Leaf Contour", xlab="X", ylab="Y")
  points(coords[,1], coords[,2], pch=19, col="blue")
  points(coords[midrib_points,1], coords[midrib_points,2], pch=19, col="red")
  
  # 返回坐标以便进一步分析
  return(coords)
}

readp_test <- function(pfile) {
  # 读取文件
  lines <- readLines(pfile)
  cat("P文件头:\n")
  for (i in 1:5) {
    cat(lines[i], "\n")
  }
  
  # 显示有多少行数据（植物节点）
  data_lines <- lines[-(1:5)]
  cat("共", length(data_lines), "个植物节点\n")
  
  # 显示前几个节点的数据
  cat("前三个节点的数据:\n")
  if (length(data_lines) >= 3) {
    for (i in 1:3) {
      cat(data_lines[i], "\n")
    }
  } else {
    for (i in 1:length(data_lines)) {
      cat(data_lines[i], "\n")
    }
  }
  
  return(TRUE)
}

# Try to construct plant if both files exist
if (file.exists(sugarmaple_p_file) && file.exists(leaf_file)) {
  tryCatch({
    sugarmaple <- constructplant(sugarmaple_p_file, leaf_file)
    cat("成功构建Sugarmaple植物!\n")
    plot(sugarmaple)
  }, error = function(e) {
    cat("构建Sugarmaple植物时出错:", conditionMessage(e), "\n")
  })
}

if (file.exists(plant_file) && file.exists(leaf_file)) {
  tryCatch({
    myplant <- constructplant(plant_file, leaf_file)
    cat("成功构建My_Plant植物!\n")
    plot(myplant)
  }, error = function(e) {
    cat("构建My_Plant植物时出错:", conditionMessage(e), "\n")
  })
} 