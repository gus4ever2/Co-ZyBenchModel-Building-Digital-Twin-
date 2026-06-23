
# Make plants
pilularis <- constructplant("test/epilularis.p", "test/epilularis.l")
toona <- constructplant("test/toona.p", "test/toona.l")
sugarmaple <- constructplant("test/sugarmaple.p", "test/sugarmaple.l")

save(pilularis,toona,sugarmaple, file="data/plantexamples.RData")