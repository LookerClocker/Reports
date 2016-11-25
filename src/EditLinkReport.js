import React from 'react';

const EditLinkReport = (props) => {
    return (
        <a href={'edit_report/' + props.dependentValues}><button className="btn btn-default">Edit</button></a>
    )
};

export default EditLinkReport;
