library(YplantQMC)

# Define absolute paths
base_dir <- "D:/Programming/Projects/SmartPlants/yplantqmc"
sugarmaple_file <- file.path(base_dir, "test", "Sugarmaple.P")
leaf_file <- file.path(base_dir, "python", "output", "My_Leaf.L")
plant_file <- file.path(base_dir, "python", "output", "My_Plant.P")

# Check if files exist
cat("Checking if files exist:\n")
cat("Sugarmaple.P exists:", file.exists(sugarmaple_file), "\n")
cat("My_Leaf.L exists:", file.exists(leaf_file), "\n")
cat("My_Plant.P exists:", file.exists(plant_file), "\n")

# Test leaf file to check for midrib points
test_leaf_midrib <- function(leaf_path) {
  cat("\nTesting leaf file for midrib points...\n")
  
  # Read the leaf file
  lines <- readLines(leaf_path)
  n_points <- as.integer(lines[2])
  
  # Parse coordinates
  coords <- matrix(NA, nrow=n_points, ncol=2)
  for (i in 1:n_points) {
    parts <- strsplit(lines[i+2], " ")[[1]]
    coords[i,] <- as.numeric(parts)
  }
  
  # Find midrib points (X=0)
  midrib_indices <- which(abs(coords[,1]) < 1e-6)
  cat("Found", length(midrib_indices), "midrib points (X=0) at indices:", 
      paste(midrib_indices, collapse=", "), "\n")
  
  for (idx in midrib_indices) {
    cat("  Point", idx, ":", coords[idx,1], coords[idx,2], "\n")
  }
  
  # Plot the leaf
  plot(coords[,1], coords[,2], type="l", main="Leaf Contour", 
       xlab="X", ylab="Y", asp=1)
  points(coords[,1], coords[,2], pch=19, cex=0.5)
  points(coords[midrib_indices,1], coords[midrib_indices,2], pch=19, 
         col="red", cex=1)
  
  if(length(midrib_indices) > 0) {
    cat("✓ Leaf file has midrib points (X=0)\n")
    return(TRUE)
  } else {
    cat("❌ ERROR: Leaf file does not have any midrib points!\n")
    return(FALSE)
  }
}

# Test the leaf file
test_leaf_midrib(leaf_file)

# Construct the plants
cat("\nConstructing plants...\n")

# Construct Sugarmaple plant
if(file.exists(sugarmaple_file) && file.exists(leaf_file)) {
  sugarmaple <- constructplant(sugarmaple_file, leaf_file)
  cat("✓ Successfully constructed Sugarmaple plant\n")
  plot(sugarmaple, main="Sugarmaple")
} else {
  cat("❌ Cannot construct Sugarmaple - files not found\n")
}

# Construct My_Plant
if(file.exists(plant_file) && file.exists(leaf_file)) {
  myplant <- constructplant(plant_file, leaf_file)
  cat("✓ Successfully constructed My_Plant\n")
  plot(myplant, main="My Plant")
} else {
  cat("❌ Cannot construct My_Plant - files not found\n")
}

cat("\nTest completed.\n") 