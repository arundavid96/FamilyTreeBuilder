var neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD));

async function deleteRelationshipGetFunc(req, res) {
  const treeName = req.params.tree_name;
  console.log('treeName: ' + treeName);
  
    const query = 'match (n:Person {familyName:$treeName}) return n';
    const session = driver.session();
    console.log('Getting people');
    session.run(query,{treeName})
      .then(result => {
        const people = result.records.map(record => record.get('n').properties);
        req.session.people = people;
        
        res.render('deleteRelationship.ejs', { people, tree_name: treeName});
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error retrieving people');
      })
      .finally(() => session.close());
  }

  module.exports = deleteRelationshipGetFunc;