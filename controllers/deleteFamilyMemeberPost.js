var neo4j = require('neo4j-driver');
const getMembersFunc = require('./getMmebers');
var driver = neo4j.driver('bolt://neo4j:7687')

async function deleteFamilyMemberPostFunc(req, res) {

    var person = req.body.person;
    var dob = req.body.dob;
    var familyName = req.params.tree_name;

    var PersonExists = false;
    // console.log("in the create relationship post function");
    const session1 = driver.session();
    var relQuery = "MATCH (p:Person {name:$person , dob:$dob, familyName:$familyName}) return count(*) > 0 as PersonExists"
    var parameters = {person, dob,familyName};
    try{
      await session1.run(relQuery, parameters)
      .then(result => {
        PersonExists = result.records[0].get('PersonExists');
        console.log(PersonExists);
      })
    }catch(error){
      console.error(error);
      res.status(500).send('Error retrieving people');
    }
    finally{
        // res.render('editFamilyMember.ejs', { people : req.session.people, errorMessage: 'Person DOB is Wrong'  });
      session1.close();
    }

if(!PersonExists){
    res.render('deleteFamilyMember.ejs', { tree_name :req.params.tree_name,people : req.session.people, errorMessage: 'Person DOB is Wrong'  });
  }else{

    const session = driver.session();
    const query = 'MATCH (p:Person {name: $person, dob: $dob, familyName:$familyName}) detach delete p';
    const params = { person, dob, familyName};

    try{
      await session.run(query, params)
      .then(async () => {
        session.close();
        // res.redirect('/editFamilyMember'+req.session.familyName ,{ errorMessage: 'Person Edited'  });
        req.session.people = await getMembersFunc(req.params.tree_name )
        var successMessage = person + " with dob " + dob + " has been removed from the tree";
        res.render('deleteFamilyMember.ejs', { tree_name :req.params.tree_name ,people : req.session.people , successMessage: successMessage  });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error Editing Person');
      });
    }catch(error){

    }
    finally{
      session.close();
    }

    

  }
}

    module.exports = deleteFamilyMemberPostFunc;
    