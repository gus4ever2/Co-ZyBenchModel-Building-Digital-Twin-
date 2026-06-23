
require(YplantQMC)

eucphy <- setPhy("Photosyn", leafpars=list(Vcmax=50, Jmax=100, g1=7))

toona <- includePhy(toona, "Photosyn", leafpars=list(Vcmax=50, Jmax=100, g1=2))

r2 <- runYplant(toona, fbeam=0, PAR0=500)


southernfrance <- setLocation(lat=44)

# A daily weather object, use a constant beam fraction of 0.4.
sunnyday <- setMet(southernfrance, month=6, day=21, nsteps=12, Tmin=9, Tmax=29, PARday=22,
                   fbeamday=0, fbeammethod="constant")

# Run YplantQMC for a day. Use the built-in 'largegap' hemiphoto.
toonarun <- YplantDay(toona, sunnyday)



getci_f <- function(ppfd){
  do.call(plantecophys:::findCiTransition,
                        c(list(photofun=Photosyn),
                          toonarun$plant$phy$leafpars, 
                          list(PPFD=ppfd)))
}
getci <- Vectorize(getci_f)

                       
#do.call( toonarun$plant$phy$leafmodel,  c(toonarun$plant$phy$leafpars, list(PPFD=100)))

dat <- subset(toonarun$outdata, timeofday == unique(timeofday)[4])
cis <- getci(dat$PARleaf)
fracJmaxlimit <- mean(dat$Ci > cis)
fracJmaxlimit
  
  
