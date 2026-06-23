library(YplantQMC)

# Set working directory to test folder
setwd("./test")

# Original sugarmaple plant
if(file.exists("Sugarmaple.P")) {
  sugarmaple <- constructplant("Sugarmaple.P", "Sugarmaple.L")
  cat("Successfully constructed Sugarmaple plant\n")
  plot(sugarmaple)
} else {
  cat("Error: Sugarmaple.P file not found\n")
  cat("Files in current directory:", paste(list.files(), collapse=", "), "\n")
}

# Generated plant
if(file.exists("../python/output/My_Plant.P") && file.exists("../python/output/My_Leaf.L")) {
  myplant <- constructplant("../python/output/My_Plant.P", "../python/output/My_Leaf.L")
  cat("Successfully constructed My_Plant plant\n")
  plot(myplant)
} else {
  cat("Error: My_Plant.P or My_Leaf.L file not found\n")
}

# Test both plants
# paris <- setLocation(lat = 48.9, long = 2.4)

# sunnyday <- setMet(paris, month = 6, day = 21, nsteps = 12, Tmin = 15, Tmax = 25, PARday = 50)

# clidlrc <- setPhy("lightresponse", leafpars = list(Amax = 8.5, Rd = 0.7, phi = 0.045, theta = 0.95, reflec = 0.1, transmit = 0.05))

# maplerun <- YplantDay(sugarmaple, met = sunnyday, phy = clidlrc, hemi = smallgap)

# # psrdata(maplerun)

# mypsr <- psrdata(maplerun)

# # Formula: CO2 fixation = ALEAF (µmol m⁻² s⁻¹) * timestep (s) * LAplant (m²) (in µmol)
# mypsr$CO2_fixed <- mypsr$ALEAF * mypsr$timestep * mypsr$LAplant

# mypsr$O2_released <- mypsr$CO2_fixed

# mypsr$CO2_fixed_mmol <- mypsr$CO2_fixed / 1000
# mypsr$O2_released_mmol <- mypsr$O2_released / 1000
# mypsr$CO2_fixed_g <- mypsr$CO2_fixed / 1e6 * 44
# mypsr$O2_released_g <- mypsr$O2_released / 1e6 * 32

# simulation_start <- as.POSIXct("2025-03-12 00:00:00")
# mypsr$current_time <- simulation_start + mypsr$timeofday * 3600

# result <- mypsr[, c("current_time", "CO2_fixed_g", "O2_released_g")]

# print(result)

# 测试脚本 - 检验.L文件格式

# 定义一个简单的函数来读取.L文件并检查中脉点
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

# 测试读取文件
tryCatch({
  leaf_file <- "../python/output/My_Leaf.L"
  if(file.exists(leaf_file)) {
    coords <- readl_test(leaf_file)
    cat("成功读取叶子文件!\n")
  } else {
    cat("叶子文件不存在:", leaf_file, "\n")
  }
}, error = function(e) {
  cat("读取叶子文件时出错:", conditionMessage(e), "\n")
})

# 测试读取.P文件
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

tryCatch({
  p_file <- "../python/output/My_Plant.P"
  if(file.exists(p_file)) {
    readp_test(p_file)
    cat("成功读取P文件!\n")
  } else {
    cat("P文件不存在:", p_file, "\n")
  }
}, error = function(e) {
  cat("读取P文件时出错:", conditionMessage(e), "\n")
})
