#/bin/sh
zipname=$1
tmpfolder="tmp/"
webappfolder="WebApp/"

if [[ -n "$zipname" ]]; then
    echo "Extracting $zipname into $tmpfolder"
    unzip $zipname -d $tmpfolder
    cp -r "./$tmpfolder$webappfolder" "../"
    rm -rf $tmpfolder
else
    echo "Please provide the Flash zip filename to extract."
fi
