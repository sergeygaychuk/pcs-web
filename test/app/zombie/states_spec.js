/* test/support/states_spec.js -- testing states management
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("states", function() {
  describe("user logged in", function() {
    beforeAll(function(done) {
      browser.visit(url, function() {
        browser
        .fill('input[name="email"]', admin.email)
        .fill("input[name='password']", "password")
        .pressButton("input[name='submit']", function() {
          expect(browser.url).toEqual(url + '/#/sites');
          done();
        });
      });
    });

    afterAll(function(done) {
      browser
      .pressButton('form.form-signout input[name="submit"]', function() {
        done();
      });
    });

    describe("#states", function() {
      beforeEach(function(done) {
        browser.visit(url + "/#/devices/" + knownDevice._id, function() {
          expect(browser.url).toEqual(url + '/#/devices/' + knownDevice._id);
          expect(browser.text("a[href='#/devices/" + knownDevice._id + "/states']")).toEqual("Архив");
          browser.clickLink("a[href='#/devices/" + knownDevice._id + "/states']", done);
        });
      });

      function outputsToTxt(outputs) {
        return Object.keys(outputs).map(function(key) {
          return key + ": " + outputs[key];
        }).join(', ');
      }


      function numToFormat(num) {
        return num <= 9 ? '0' + num : '' + num;
      }

      function stampToString(st) {
        var time = numToFormat(st.getHours()) + ":" + numToFormat(st.getMinutes()) + ":" + numToFormat(st.getSeconds());
        var date = numToFormat(st.getDate()) + "." + numToFormat(st.getMonth() + 1) + "." + numToFormat(st.getFullYear());
        return time + " " + date;
      }

      it("should show first page with states", function(done) {
        State.find({device: knownDevice._id}, "_id stamp outputs").sort({ stamp: -1 }).limit(25).exec(function(err, states) {
          if (err)
            throw err;
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          var pager = browser.queryAll("div.page > b");
          expect(pager.length).toEqual(3);

          expect(pager[0].textContent).toEqual("1");
          expect(pager[1].textContent).toEqual("25");
          expect(pager[2].textContent).toEqual("50");
          for (var idx in states) {
            var item = states[idx];
            var row = browser.queryAll("td", table[idx]);
            expect(row[1].textContent).toEqual(knownDevice.name);
            expect(row[2].textContent).toEqual(outputsToTxt(item.outputs));
            expect(row[3].textContent).toEqual(stampToString(item.stamp));
          };
          done();
        });
      });

      it("should show second page with states", function(done) {
        State.find({device: knownDevice._id}, "_id stamp outputs").sort({ stamp: -1 }).skip(25).limit(25).exec(function(err, states) {
          if (err)
            throw err;
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          var pager = browser.queryAll("div.page > b");
          expect(pager.length).toEqual(3);

          expect(pager[0].textContent).toEqual("1");
          expect(pager[1].textContent).toEqual("25");
          expect(pager[2].textContent).toEqual("50");

          browser.clickLink("ul.pagination > li > a[href='#/devices/" + knownDevice._id + "/states?page=2']", function() {
            browser.wait(function() {
              return browser.queryAll("table.tp-data > tbody > tr").length === 25;
            }, function() {
              table = browser.queryAll("table.tp-data > tbody > tr")
              expect(table.length).toEqual(25);
              pager = browser.queryAll("div.page > b");
              expect(pager.length).toEqual(3);
              expect(pager[0].textContent).toEqual("26");
              expect(pager[1].textContent).toEqual("50");
              expect(pager[2].textContent).toEqual("50");

              for (var idx in states) {
                var item = states[idx];
                var row = browser.queryAll("td", table[idx]);
                expect(row[1].textContent).toEqual(knownDevice.name);
                expect(row[2].textContent).toEqual(outputsToTxt(item.outputs));
                expect(row[3].textContent).toEqual(stampToString(item.stamp));
              };
              done();
            });
          });
        });
      });
    });

    describe("#show", function() {
      var state = null;
      beforeEach(function(done) {
        browser.visit(url + "/#/devices/" + knownDevice._id + "/states", function() {
          expect(browser.url).toEqual(url + '/#/devices/' + knownDevice._id + "/states");
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          browser.clickLink(table[0], function() {
            State.find({device: knownDevice._id}, "_id stamp outputs").
              sort({ stamp: -1 }).limit(1).
              exec(function(err, states) {
                expect(browser.url).toEqual(url + '/#/devices/' + knownDevice._id + "/states/" + states[0]._id);
                state = states[0];
                done();
            });
          });
        });
      });

      it("should show device name", function(done) {
        expect(browser.text("label[id='lblDevice']")).toEqual("Контроллер");
        expect(browser.text("a[href='#/devices/" + knownDevice._id + "']")).toEqual(knownDevice.name);
        done();
      });

      it("should show outputs", function(done) {
        for (var key in state.outputs) {
          expect(browser.text("label[id='" + key + "']")).toEqual(key);
          expect(browser.text("p[id='" + key + "txt']")).toEqual(state.outputs[key].toString());
        }
        done();
      });
    });
  });
});


