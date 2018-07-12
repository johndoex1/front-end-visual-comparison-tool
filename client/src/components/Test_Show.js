import React, { Component } from 'react';

class TestShow extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  componentWillMount() {
    this.props.fetchTest(this.props.params.id);
  }

  onRemoveClick() {
    this.props.removeTest(this.props.params.id)
      .then(() => {
        this.context.router.push('/');
      })
  }

  render() {
    const { test } = this.props;

    if (!test) {
      return <div>Loading...</div>
    }

    return (
      <div>
        <Link to="/">Return to all tests...</Link>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { test: state.tests.test }
}

export default connect(mapStateToProps, { fetchTest, removeTest })(TestShow)