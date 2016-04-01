// Set all users with approved trial requests to a teacher or teacher-like role, depending on trial request

db.trial.requests.find({status: 'approved'}).limit(10).forEach(function(trialRequest) {
    var role = trialRequest.properties.role || 'teacher';
    var user = db.users.findOne({_id: trialRequest.applicant}, {role:1, name:1, email:1});
    print(JSON.stringify(user), JSON.stringify(trialRequest.properties), role);
    if (!user.role) {
        print(db.users.update({_id: trialRequest.applicant}, {$set: {role: role}}));
    }
});

// Removes all users with a teacher-like role from classroom membership
// Usage: copy and paste into mongo

var teacherRoles = ['teacher', 'technology coordinator', 'advisor', 'principal', 'superintendent'];

db.users.find({'role': {$in: teacherRoles}}, {_id: 1, name: 1, email: 1, role: 1}).forEach(function(user) {
    print('Updating user', JSON.stringify(user));
    print(db.classrooms.find({members: user._id}, {name: 1}).toArray().length);
    print(db.classrooms.update({members: user._id}, {$pull: {members: user._id}}, {multi: true}));
});


// Finds all members of classrooms, sets their role to 'student' if they do not already have a role
// Usage: copy and paste into mongo

db.classrooms.find({}, {members: 1}).forEach(function(classroom) {
    if(!classroom.members) {
        return;
    }
    for (var i in classroom.members) {
        var memberID = classroom.members[i];
        print('updating member', memberID);
        print(db.users.update({_id: memberID, role: {$exists: false}}, {$set: {role: 'student'}}));
    } 
});