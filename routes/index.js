var https = require('https');
var http = require('http');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var url = require('url');

module.exports = function (app, addon) {
    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });

    app.post('/associate-user', function (req, res) {
            var bitBucketUsername = req.query['bitBucketUsername'];
            var bintrayUsername = req.body.username;
            var apiKey = req.body.apiKey;

            var BintrayUser = getBintrayUser();
            BintrayUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Bintray user: ' + err.message);
                    return;
                }
                if (data == null) {
                    var newUser = new BintrayUser({
                        bitBucketUsername: bitBucketUsername,
                        bintrayUsername: bintrayUsername,
                        apiKey: apiKey
                    });
                    newUser.save(function (err) {
                        if (err) {
                            res.send('Error occurred while creating a new associated Bintray user:' + err.message);
                        } else {
                            console.log('BINTRAY: CREATING NEW ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bintrayUsername);
                        }
                    });
                } else {
                    data.bintrayUsername = bintrayUsername;
                    data.apiKey = apiKey;
                    data.save(function (err) {
                        if (err) {
                            res.send('Error occurred while updating associated Bintray user:' + err.message);
                        } else {
                            console.log('BINTRAY: UPDATING EXISTING ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bintrayUsername);
                        }
                    });
                }
            });
            res.render('associate-user', {username: bintrayUsername, apiKey: apiKey});
        }
    );

    app.get('/associate-user', function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];
        var BintrayUser = getBintrayUser();
        BintrayUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bintray user: ' + err.message);
                return;
            }
            if (data == null) {
                res.render('associate-user', {username: null, apiKey: null});
            } else {
                res.render('associate-user', {username: data.bintrayUsername, apiKey: data.apiKey})
            }
        });
    });

    app.post('/artifactory-user', function (req, res) {
            var bitBucketUsername = req.query['bitBucketUsername'];
            var url = req.body.url;
            var artifactoryUsername = req.body.username;
            var password = req.body.password;
            var ArtifactoryUser = getArtifactoryUser();
            ArtifactoryUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Artifactory user: ' + err.message);
                    return;
                }
                if (data == null) {
                    var newUser = new ArtifactoryUser({
                        bitBucketUsername: bitBucketUsername,
                        url: url,
                        artifactoryUsername: artifactoryUsername,
                        password: password
                    });
                    newUser.save(function (err) {
                        if (err) {
                            res.send('Error occurred while creating a new associated Artifactory user:' + err.message);
                        } else {
                            console.log('Artifactory: CREATING NEW ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + artifactoryUsername);
                        }
                    });
                } else {
                    data.url = url;
                    data.artifactoryUsername = artifactoryUsername;
                    data.password = password;
                    data.save(function (err) {
                        if (err) {
                            res.send('Error occurred while updating associated Artifactory user:' + err.message);
                        } else {
                            console.log('Artifactory: UPDATING EXISTING ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + artifactoryUsername);
                        }
                    });
                }
            });
            res.render('artifactory-user', {username: artifactoryUsername, password: password, url: url});
        }
    );
    app.get('/artifactory-user', function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];

        var ArtifactoryUser = getArtifactoryUser();
        ArtifactoryUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Artifactory user: ' + err.message);
                return;
            }
            if (data == null) {
                res.render('artifactory-user', {url: null, username: null, password: null});
            } else {
                res.render('artifactory-user', {
                    url: data.url,
                    username: data.artifactoryUsername,
                    password: data.password
                })
            }
        });
    });

    app.post('/bamboo-user', function (req, res) {
            var bitBucketUsername = req.query['bitBucketUsername'];
            var url = req.body.url;
            var bambooUsername = req.body.username;
            var password = req.body.password;
            var BambooUser = getBambooUser();
            BambooUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
                    return;
                }
                if (data == null) {
                    var newUser = new BambooUser({
                        bitBucketUsername: bitBucketUsername,
                        url: url,
                        bambooUsername: bambooUsername,
                        password: password
                    });
                    newUser.save(function (err) {
                        if (err) {
                            res.send('Error occurred while creating a new associated Bamboo user:' + err.message);
                        } else {
                            console.log('Bamboo: CREATING NEW ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bambooUsername);
                        }
                    });
                } else {
                    data.url = url;
                    data.bambooUsername = bambooUsername;
                    data.password = password;
                    data.save(function (err) {
                        if (err) {
                            res.send('Error occurred while updating associated Bamboo user:' + err.message);
                        } else {
                            console.log('Bamboo: UPDATING EXISTING ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bambooUsername);
                        }
                    });
                }
            });

            res.render('bamboo-user', {username: bambooUsername, password: password, url: url});
        }
    );

    app.get('/bamboo-user', function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];

        var BambooUser = getBambooUser();
        BambooUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
                return;
            }
            if (data == null) {
                res.render('bamboo-user', {url: null, username: null, password: null});
            } else {
                res.render('bamboo-user', {url: data.url, username: data.bambooUsername, password: data.password})
            }
        });
    });

    app.get('/associate-package', addon.authenticate(), function (req, res) {
            var repoUuid = req.query['repoUuid'];

            console.log('FOUND UUID' + repoUuid);

            var BintrayPackage = getBintrayPackage();
            BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                    return;
                }
                if (data == null) {
                    res.render('associate-package', {packagePath: null});
                } else {
                    res.render('associate-package', {packagePath: data.bintrayPackage})
                }
            });
        }
    );

    app.post('/associate-package', function (req, res) {
        var repoUuid = req.query['repoUuid'];
        var packagePath = req.body.packagePath;

        var BintrayPackage = getBintrayPackage();
        BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                return;
            }
            if (data == null) {
                var newPackage = new BintrayPackage({
                    bitBucketRepoUuid: repoUuid,
                    bintrayPackage: packagePath
                });
                newPackage.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Bintray package:' + err.message);
                    } else {
                        console.log('BINTRAY: CREATING NEW ASSOCIATION OF ' + repoUuid + ' WITH ' + packagePath);
                    }
                });
            } else {
                data.bintrayPackage = packagePath;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Bintray package:' + err.message);
                    } else {
                        console.log('BINTRAY: UPDATING EXISTING ASSOCIATION OF ' + repoUuid + ' WITH ' + packagePath);
                    }
                });
            }
        });
        res.render('associate-package', {packagePath: packagePath});
    });

    app.get('/associate-bamboo-build', addon.authenticate(), function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];
        var repoUuid = req.query['repoUuid'];
        var builds = [];
        console.log('FOUND UUID' + repoUuid);
        bambooRequestOptions('result', bitBucketUsername, function (options) {
            var protocol = options.nameProtocol === "http" ? http : https;
            var reqGet = protocol.get(options, function (resGet) {
                console.log('STATUS: ' + resGet.statusCode);
                resGet.setEncoding('utf8');
                var rawData = [];
                resGet.on('data', function (chunk) {
                    rawData.push(chunk);
                });
                resGet.on('end', function (resGet) {

                    var chunk = rawData.join('');
                    reqGet.write(chunk);
                    parseString(chunk, function (err, result) {
                        var build_object_list = result.results.results["0"];
                        build_list = JSON.parse(JSON.stringify(build_object_list.result));
                        for (var key in build_list) {
                            var build = build_list[key];
                            builds.push({"buildKey": build.plan[0].$.key, "buildName": build.plan[0].$.name});
                        }


                        var BambooBuild = getBambooBuild();
                        BambooBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                            if (err) {
                                res.send('Error occurred while querying for an already existing associated Bamboo Build: ' + err.message);
                                return;
                            }
                            if (data == null) {
                                res.render('associate-bamboo-build', {builds: builds});

                            } else {
                                var selected = [{"buildName": data.bambooBuildName, "buildKey": data.bambooBuildKey}];
                                res.render('associate-bamboo-build', {builds: builds, selected: selected});
                            }
                        });
                    });
                });
            });
            reqGet.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            reqGet.end();
        });
    });

    app.post('/associate-bamboo-build', function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];
        var repoUuid = req.query['repoUuid'];
        var bambooBuildName = req.body["select-build"];
        var bambooBuildKey = bambooBuildName.split(":")[1];
        var BambooBuild = getBambooBuild();
        BambooBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bamboo Build: ' + err.message);
                return;
            }
            if (data == null) {
                var newBambooBuild = new BambooBuild({
                    bitBucketRepoUuid: repoUuid,
                    bambooBuildName: bambooBuildName,
                    bambooBuildKey: bambooBuildKey
                });
                newBambooBuild.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Bamboo Build:' + err.message);
                    } else {
                        console.log('BAMBOO: CREATING NEW ASSOCIATION OF ' + repoUuid + ' WITH ' + bambooBuildName);
                    }
                });
            } else {
                data.bambooBuildName = bambooBuildName;
                data.bambooBuildKey = bambooBuildKey;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Bamboo Build:' + err.message);
                    } else {
                        console.log('BAMBOO: UPDATING EXISTING ASSOCIATION OF ' + repoUuid + ' WITH ' + bambooBuildName);
                    }
                });
            }
        });
        var selected = [{"buildName": bambooBuildName, "buildKey": null}];
        res.render('associate-bamboo-build', {selected: selected});
    });
    app.get('/associate-artifactory-build', addon.authenticate(), function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];
        var repoUuid = req.query['repoUuid'];
        var builds;
        console.log('FOUND UUID' + repoUuid);
        artifactoryRequestOptions('build', bitBucketUsername, function (options) {
            var protocol = options.nameProtocol === "http" ? http : https;
            var reqGet = protocol.request(options, function (resGet) {
                console.log('STATUS: ' + resGet.statusCode);
                resGet.setEncoding('utf8');
                var rawData = [];
                resGet.on('data', function (chunk) {
                    rawData.push(chunk);
                });
                resGet.on('end', function (resGet) {
                    var chunk = rawData.join('');
                    reqGet.write(chunk);
                    var list = JSON.parse(chunk);
                    builds = list["builds"];
                    var ArtifactoryBuild = getArtifactoryBuild();
                    ArtifactoryBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                        if (err) {
                            res.send('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
                            return;
                        }
                        if (data == null) {
                            res.render('associate-artifactory-build', {builds: builds})
                        } else {
                            var selected = [{'uri': data.artifactoryBuild}];
                            res.render('associate-artifactory-build', {builds: builds, selected: selected})
                        }
                    });
                });
            });
            reqGet.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            reqGet.end();
        });
    });

    app.post('/associate-artifactory-build', function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];
        var repoUuid = req.query['repoUuid'];
        var artifactoryBuild = req.body["select-build"];
        var ArtifactoryBuild = getArtifactoryBuild();
        ArtifactoryBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
                return;
            }
            if (data == null) {
                var newArtifactoryBuild = new ArtifactoryBuild({
                    bitBucketRepoUuid: repoUuid,
                    artifactoryBuild: artifactoryBuild
                });
                newArtifactoryBuild.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Artifactory Build:' + err.message);
                    } else {
                        console.log('ARTIFACTORY: CREATING NEW ASSOCIATION OF ' + repoUuid + ' WITH ' + artifactoryBuild);
                    }
                });
            } else {
                data.artifactoryBuild = artifactoryBuild;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Artifactory Build:' + err.message);
                    } else {
                        console.log('ARTIFACTORY: UPDATING EXISTING ASSOCIATION OF ' + repoUuid + ' WITH ' + artifactoryBuild);
                    }
                });
            }
        });
        var selected = [{'uri': artifactoryBuild}];
        res.render('associate-artifactory-build', {selected: selected});
    });

    app.get('/browse-package-versions', addon.authenticate(), function (originalReq, originalRes) {
            var httpClient = addon.httpClient(originalReq);

            var repoUuid = originalReq.query['repoUuid'];

            var BintrayPackage = getBintrayPackage();
            BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                if (err) {
                    originalRes.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                    return;
                }
                if ((data == null) || (data.bintrayPackage == null)) {
                    var repoPath = originalReq.query['repoPath'];

                    var repoChangeset = repoChangesetUrl(repoPath);
                    httpClient.get(repoChangeset, function (changesetErr, changesetResponse, rawChangesetData) {
                        var rev = latestRev(rawChangesetData);

                        var bintrayRepoFile = bintrayRepoFileUrl(originalReq.query.repoPath, rev);
                        httpClient.get(bintrayRepoFile, function (bintrayRepoFileErr, bintrayRepoFileResponse, bintrayRepoFileData) {

                            var bintrayRepoFileContent = JSON.parse(bintrayRepoFileData).data;
                            var bintrayRepoFile = JSON.parse(bintrayRepoFileContent);

                            var options = bintrayRequestOptions(bintrayRepoFile.path);
                            requestBintrayPackageInfo(options, originalRes);
                        });
                    });
                } else {
                    var options = bintrayRequestOptions(data.bintrayPackage);
                    requestBintrayPackageInfo(options, originalRes);
                }
            });
        }
    );

    app.get('/triggerBuild/:planKey/:bitBucketUsername', function (req, res) {
        var bitBucketUsername = req.params.bitBucketUsername;
        var planKey = req.params.planKey;
        var post_data = '?stage&ExecuteAllStages';
        bambooRequestOptions('queue/' + planKey, bitBucketUsername, function (options) {
            options.headers = {'Content-Length': Buffer.byteLength(post_data)};
            options.method = 'POST';
            var protocol = options.nameProtocol === "http" ? http : https;
            var post_req = protocol.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log(chunk);
                });
            });
            // post the data
            post_req.write(post_data);
            post_req.end();

        });

    });

    app.post('/triggerBuild', function (req, res) {

    });


    app.get('/downloadArchive/:bitBucketUsername/:buildName/:buildNumber', function (originalRequest, originalResponse) {
        var bitBucketUsername = originalRequest.params.bitBucketUsername;
        var buildName = originalRequest.params.buildName;
        var buildNumber = originalRequest.params.buildNumber;
        var file_name = buildName + "_" + buildNumber + ".zip";
        var file = fs.createWriteStream(file_name);
        var post_data = '{"buildName":"' + buildName + '","buildNumber":"' + buildNumber + '","archiveType":"zip"}';
        artifactoryRequestOptions('/archive/buildArtifacts', bitBucketUsername, function (options) {
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(post_data)
            };
            options.method = 'POST';
            var protocol = options.nameProtocol === "http" ? http : https;
            var post_req = protocol.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    //console.log(chunk);
                    file.write(chunk);
                });
                res.on('end', function (res) {
                    file.end();
                    originalResponse.download(file.path);
                });
            });
            post_req.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            // post the data
            post_req.write(post_data);
            post_req.end();
        });


    });

    app.get('/jfrog', function (req, res) {
        var bitBucketUsername = req.query['bitBucketUsername'];
        var repoUuid = req.query['repoUuid'];
        var BambooBuild = getBambooBuild();
        var buildInfo = [];
        BambooBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bamboo Build ' + err.message);
            }
            if (data == null) {
                console.log("Bamboo build is not selected");
            } else {

                bambooRequestOptions('result/' + data.bambooBuildKey, bitBucketUsername, function (options) {
                    var protocol = options.nameProtocol === "http" ? http : https;
                    var reqBambooGet = protocol.request(options, function (resBambooGet) {
                        console.log('STATUS: ' + resBambooGet.statusCode);
                        resBambooGet.setEncoding('utf8');
                        var rawData = [];
                        resBambooGet.on('data', function (chunk) {
                            rawData.push(chunk);
                        });
                        resBambooGet.on('end', function (resBambooGet) {
                            var chunk = rawData.join('');
                            reqBambooGet.write(chunk);
                            parseString(chunk, function (err, result) {
                                buildInfo = result.results.results[0].result;
                                var ArtifactoryBuild = getArtifactoryBuild();
                                ArtifactoryBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                                    if (err) {
                                        res.send('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
                                        return;
                                    }
                                    if (data == null) {
                                        console.log("Artifactory Build is not selected");
                                    } else {
                                        var list_object = [];
                                        for (var key in buildInfo) {
                                            (function (key) {
                                                list_object.push(key);
                                                var number = buildInfo[key].buildNumber[0];
                                                buildInfo[key].bitBucketUsername = bitBucketUsername;
                                                buildInfo[key].buildLink = buildInfo[key].link["0"].$.href.replace("rest/api/latest/result", "browse");
                                                console.log(data.artifactoryBuild);
                                                artifactoryRequestOptions('build' + data.artifactoryBuild + "/" + number, bitBucketUsername, function (artifactoryOptions) {
                                                    console.log(artifactoryOptions.path);
                                                    console.log(artifactoryOptions.host);
                                                    console.log(artifactoryOptions.port);
                                                    var artiProtocol = artifactoryOptions.nameProtocol === "http" ? http : https;
                                                    var reqGet = artiProtocol.request(artifactoryOptions, function (resGet) {
                                                        console.log('STATUS: ' + resGet.statusCode);
                                                        resGet.setEncoding('utf8');
                                                        console.log("HEADERS:" + JSON.stringify(resGet.headers));
                                                        var rawDataArti = [];
                                                        resGet.on('data', function (chunk) {
                                                            rawDataArti.push(chunk);
                                                        });
                                                        resGet.on('end', function (resGet) {
                                                            var chunkArti = rawDataArti.join('');
                                                            reqGet.write(chunkArti);
                                                            console.log(number);
                                                            if(chunkArti.indexOf("<") > -1){
                                                                var artBuildInfo = " ";
                                                            }else{
                                                                var artBuildInfo = JSON.parse(chunkArti);
                                                            }
                                                            if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.name != undefined) {
                                                                buildInfo[key].artName = artBuildInfo.buildInfo.name;
                                                            } else {
                                                                buildInfo[key].artName = " ";
                                                            }
                                                            if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.principal != undefined) {
                                                                buildInfo[key].principal = artBuildInfo.buildInfo.principal;
                                                            } else {
                                                                buildInfo[key].principal = " ";
                                                            }
                                                            if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.buildAgent != undefined) {
                                                                buildInfo[key].buildAgent = artBuildInfo.buildInfo.buildAgent;
                                                            } else {
                                                                buildInfo[key].buildAgent = " ";
                                                            }
                                                            if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.number != undefined) {
                                                                buildInfo[key].artBuildNumber = artBuildInfo.buildInfo.number;
                                                            } else {
                                                                buildInfo[key].artBuildNumber = " ";
                                                            }
                                                            if (artBuildInfo.uri != undefined && artBuildInfo.uri != undefined) {
                                                                buildInfo[key].uri = artBuildInfo.uri.replace("api/build", "webapp/#/builds");
                                                            } else {
                                                                buildInfo[key].uri = " ";
                                                            }
                                                            if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.started != undefined) {
                                                                buildInfo[key].promotionTime = artBuildInfo.buildInfo.started;
                                                            } else {
                                                                buildInfo[key].promotionTime = " ";
                                                            }
                                                            if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.statuses != undefined) {
                                                                buildInfo[key].statuses = artBuildInfo.buildInfo.statuses;
                                                            } else {
                                                                buildInfo[key].statuses = [];
                                                            }
                                                            var BintrayPackage = getBintrayPackage();
                                                            BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                                                                if (err) {
                                                                    res.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                                                                    return;
                                                                }
                                                                if ((data == null) || (data.bintrayPackage == null)) {
                                                                    console.log("Package not found!");
                                                                } else {
                                                                    var post_data = '[{"buildNumber":["' + buildInfo[key].artBuildNumber + '"]},{"buildName":["' + buildInfo[key].artName.replace(/ /g, "%20") + '"]}]';
                                                                    var path = 'search/attributes/' + data.bintrayPackage + 'versions';
                                                                    bintrayRequestOptionsPost(path, bitBucketUsername, post_data, function (options) {
                                                                        var post_req = https.request(options, function (resPost) {
                                                                            resPost.setEncoding('utf8');
                                                                            var output = [];
                                                                            resPost.on('data', function (chunk) {
                                                                                output.push(chunk);
                                                                            });
                                                                            resPost.on('end', function (resPost) {
                                                                                var chunk = output.join('');
                                                                                if (chunk != "[]") {
                                                                                    var vesion = JSON.parse(chunk);
                                                                                    buildInfo[key].version = vesion[0].name;
                                                                                    buildInfo[key].repo = vesion[0].repo;
                                                                                    buildInfo[key].package = vesion[0].package;
                                                                                    buildInfo[key].owner = vesion[0].owner;
                                                                                } else {
                                                                                    buildInfo[key].version = " ";
                                                                                    buildInfo[key].repo = " ";
                                                                                    buildInfo[key].package = " ";
                                                                                    buildInfo[key].owner = " ";
                                                                                }
                                                                                list_object.splice(list_object.indexOf(key), 1);
                                                                                if (list_object.length == 0) {
                                                                                    res.render('jfrog', {
                                                                                        bambooBuildInfo: buildInfo
                                                                                    });
                                                                                }
                                                                            });
                                                                        });
                                                                        post_req.write(post_data);
                                                                        post_req.on('error', function (err) {
                                                                            console.log('error: ' + err.message);
                                                                        });
                                                                        post_req.end();
                                                                    });

                                                                }
                                                            });
                                                        });
                                                    });
                                                    reqGet.on('error', function (e) {
                                                        console.log('problem with request: ' + e.message);
                                                    });
                                                    reqGet.end();
                                                });


                                            })(key);
                                        }
                                    }
                                });
                            });
                        });
                    });

                    reqBambooGet.on('error', function (e) {
                        console.log('problem with request: ' + e.message);
                    });
                    reqBambooGet.end();

                });


            }
        });
    });

    app.post('/jfrog', function (req, res) {

    });

    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for (var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }

    function latestRev(rawChangesetData) {
        var changesetData = JSON.parse(rawChangesetData);
        return changesetData.changesets[0].raw_node;
    }

    function repoChangesetUrl(repoPath) {
        return '/api/1.0/repositories/' + repoPath + '/changesets?limit=1'
    }

    function bintrayRepoFileUrl(repoPath, rev) {
        return '/api/1.0/repositories/' + repoPath + '/src/' + rev + '/.bintray-package.json'
    }

    function bintrayRequestOptions(packagePath) {
        var options = {
            host: 'api.bintray.com',
            port: 443,
            path: '/packages/' + packagePath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return options;
    }


    var bintrayRequestOptionsPost = function (path, bitBucketUsername, post_data, callback) {
        var options;
        var BintrayUser = getBintrayUser();
        BintrayUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                console.log('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
            }
            if (data == null) {
                console.log(" not found");
            } else {
                options = {
                    host: 'api.bintray.com',
                    port: 443,
                    path: '/' + path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(post_data)
                    }, auth: data.bintrayUsername + ':' + data.apiKey
                };
            }
            callback(options);
        });
    };

    var bambooRequestOptions = function (path, bitBucketUsername, callback) {
        var options;
        var BambooUser = getBambooUser();
        BambooUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                console.log('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
            }
            if (data == null) {
                console.log(" not found");
            } else {
                var host_url = url.parse(data.url);
                options = {
                    host: host_url.hostname,
                    port: host_url.port || 80,
                    path: '/rest/api/latest/' + path,
                    method: 'GET',
                    nameProtocol: host_url.protocol.split(':')[0],
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: data.bambooUsername + ':' + data.password
                };
            }
            callback(options);
        });
    };

    var artifactoryRequestOptions = function (path, bitBucketUsername, callback) {
        var options;
        var ArtifactoryUser = getArtifactoryUser();
        ArtifactoryUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                console.log('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
            }
            if (data == null) {
                console.log(" not found");
            } else {
                var host_url = url.parse(data.url);
                options = {
                    host: host_url.hostname,
                    port: host_url.port || 80,
                    path: '/artifactory/api/' + path,
                    method: 'GET',
                    nameProtocol: host_url.protocol.split(':')[0],
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: data.artifactoryUsername + ':' + data.password
                };

            }
            callback(options);
        });
    };

    function requestBintrayPackageInfo(options, originalRes) {
        var bintrayReq = https.request(options, function (bintrayRes) {
            bintrayRes.setEncoding('utf8');

            var output = '';
            bintrayRes.on('data', function (chunk) {
                output += chunk;
            });

            bintrayRes.on('end', function () {
                var obj = JSON.parse(output);
                console.log("onResult: " + JSON.stringify(obj));
                originalRes.render('browse-package-versions', {
                    title: obj['name'],
                    owner: obj['owner'],
                    repo: obj['repo'],
                    latestVersion: obj['latest_version'],
                    versions: obj['versions']
                });
            });
        });

        bintrayReq.on('error', function (err) {
            originalRes.send('error: ' + err.message);
        });

        bintrayReq.end();
    }
};
